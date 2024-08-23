package com.sas.server.service.game;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import com.sas.server.dto.game.ActionData;
import com.sas.server.dto.game.SlimeDTO;
import com.sas.server.dto.queue.IngameData;
import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.GameEntity;
import com.sas.server.entity.PlayerEntity;
import com.sas.server.entity.RankerEntity;
import com.sas.server.exception.LockAcquisitionException;
import com.sas.server.game.message.MessengerBroker;
import com.sas.server.game.rule.ActionSystem;
import com.sas.server.game.rule.BattleSystem;
import com.sas.server.repository.GameRepository;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.player.PlaylogService;
import com.sas.server.service.ranker.RankerService;
import com.sas.server.util.ActivityType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameRepository gameRepo;
    private final PlayerService playerService;
    private final CubeService cubeService;
    private final RankerService rankerService;
    private final PlaylogService playlogService;
    private final LogService logService;

    private final BattleSystem battleSystem;
    private final ActionSystem actionSystem;

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final MessengerBroker msgBroker;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private ScheduledFuture<?> scheduledFuture;

    private final StringRedisTemplate redisTemplate;

    private UUID GAME_ID;
    private int GAME_SIZE;

    public UUID getGameId() {
        return GAME_ID;
    }

    public GameEntity createGame(int initialSize, String title) {

        GameEntity game = GameEntity.builder()
                .id(UUID.randomUUID())
                .title(title)
                .size(initialSize)
                .build();

        GAME_ID = game.id;

        gameRepo.save(game);

        return game;
    }

    public GameEntity findGame() {

        return gameRepo.findById(GAME_ID)
                .orElseThrow(() -> new IllegalArgumentException("Game Entity not found with id"));

    }

    public void saveGame(GameEntity game) {

        Objects.requireNonNull(game, "[saveGame] game is null");

        gameRepo.save(game);

    }

    @Recover
    public String recoverIngame(LockAcquisitionException e, String sessionId) {

        throw e;

    }

    /**
     * PlayerEntity와 해당 포지션 lockey를 삭제.
     * 
     * @param game
     * @param sessionId
     * @throws NullPointerException
     */
    public void removePlayer(String username) {

        PlayerEntity player = playerService.findById(username);

        String lockKey = "lock:cube:" + player.position;

        redisTemplate.delete(lockKey);
        playerService.deleteById(lockKey);

    }

    @Retryable(value = { LockAcquisitionException.class }, maxAttempts = 15, backoff = @Backoff(delay = 200))
    public Map<String, SlimeDTO> findAllSlimes() {

        Map<String, SlimeDTO> slimeSet = new HashMap<>();

        List<PlayerEntity> playerSet = playerService.findAllByInGame();

        for (PlayerEntity player : playerSet) {

            CubeEntity cube = cubeService.findByName(player.position);

            SlimeDTO slimeDTO = SlimeDTO.builder()
                    .username(player.username)
                    .attr(player.attr)
                    .direction("down")
                    .target(cube.name)
                    .build();

            slimeSet.put(player.username.toString(), slimeDTO);
        }
        return slimeSet;
    }

    @Recover
    public Map<String, SlimeDTO> recover(LockAcquisitionException e) {

        log.error("[FindAllSlimes] 재요청 모두 실패.");

        return null;
    }

    public void scanQueue() {

        GameEntity game = gameRepo.findById(GAME_ID)
                .orElseThrow(() -> new NullPointerException("Game Entity not found with id"));

        // 큐브 최대 갯수
        int max = game.size * game.size - 1;

        // 난수 생성 셋팅
        Random random = new Random();
        random.setSeed(System.currentTimeMillis());

        // 무작위로 키를 조회.
        // 큐브 번호는 0~(size*size-1)
        // 락이 존재한다면 키번호 수정 후 재시도.
        // 락을 획득했다면 플레이어 투입.

        Iterator<PlayerEntity> waiterItr = playerService.findAllByInQueue().iterator();

        while (waiterItr.hasNext()) {

            String position = "slimebox" + random.nextInt(max);
            String lockKey = "lock:cube:" + position;

            if (redisTemplate.opsForSet().size(lockKey) == 0) {

                PlayerEntity player = waiterItr.next();
                redisTemplate.opsForSet().add(lockKey, "");

                // 참가하기 전, 기존 슬라임이 존재한다면 삭제.
                if (playerService.ingameById(player.username) != null) {
                    redisTemplate.delete("lock:cube:" + player.position);
                    simpMessagingTemplate.convertAndSend("/topic/game/deleteSlime", player.username);
                }

                // 큐 플래그 off, 위치 추가.
                playerService.updatePlayer(player.toBuilder()
                        .inQueue(false)
                        .position(position)
                        .build());
                
                // 실시간 랭킹에 추가
                rankerService.updateRealtimeRank(player);

                // 플레이어라면 시작 로그 기록
                if(!player.ai)
                    logService.save(player.username, ActivityType.PLAY);

                SlimeDTO slime = SlimeDTO.builder()
                        .username(player.username)
                        .attr(player.attr)
                        .direction("down")
                        .target(position)
                        .build();

                IngameData ingameData = IngameData.builder()
                        .username(player.username)
                        .position(position)
                        .build();

                simpMessagingTemplate.convertAndSendToUser(player.username,
                        "/queue/player/ingame",
                        ingameData);

                simpMessagingTemplate.convertAndSend("/topic/game/addSlime", slime);
            }

        }
    }

    /**
     * 
     * @param sessionId
     * @param direction
     * @return MoveData형식으로 슬라임 닉네임, 위치 리턴. 실패시 null
     */
    // @Retryable(value = { LockAcquisitionException.class }, maxAttempts = 15,
    // backoff = @Backoff(delay = 200))
    // @DistributedLock(key = "'lock:user:' + #username", watingTime = 500, timeUnit
    // = TimeUnit.MILLISECONDS)
    public ActionData updateMove(String username, String direction) {

        PlayerEntity player = playerService.findById(username);

        if (actionSystem.isLocked(username)) {
            return ActionData.builder()
                    .actionType("LOCKED")
                    .direction(direction)
                    .username(player.username)
                    .build();
        }

        return processMove(player, direction);

    }

    @Recover
    public ActionData recoverMove(LockAcquisitionException e, String username, String direction) {

        log.error("{}의 moving 메소드가 모두 실패", username);

        PlayerEntity player = playerService.findById(username);

        return ActionData.builder()
                .actionType("LOCKED")
                .direction(direction)
                .username(player.username)
                .build();
    }

    /**
     * 
     * @param game
     * @param sessionId
     * @param direction
     * @return ActionData
     */
    private ActionData processMove(PlayerEntity player, String direction) {

        // position 예시 slimebox##
        String departCube = player.position;

        CubeEntity target = cubeService.getNextCube(departCube, direction);
        PlayerEntity enemy = searchEnemy(target.name);
        long lockTime = actionSystem.lock(player, target);

        String actionType;

        // 이동 위치가 같은 큐브일 때, 플레이어 스스로가 적이 되는 것 방지
        if (departCube.equals(target.name))
            enemy = null;

        // 플레이어를 필드에서 제거.
        redisTemplate.delete("lock:cube:" + player.position);

        // 적이 존재하지 않을시 MOVE.
        // 승리했다면 ATTACK
        // 천적이라면 FEARED
        // 무승부라면 DRAW
        actionType = battleSystem.attrJudgment(player, enemy);

        // 전투가 일어났을 때만 반영
        if (actionType.equals("ATTACK")) {

            // 패배자 삭제 및 리얼타임 랭크에서 삭제, 그 후 올타임 랭크에 기록
            redisTemplate.delete("lock:cube:" + enemy.position);
            playerService.deleteById(enemy.username);
            rankerService.removeRealtimeRank(enemy.username);
            rankerService.updateAlltimeRank(enemy);
            
            // ai가 아닐때만 플레이 로그 저장
            if(!enemy.ai){
                playlogService.save(enemy);
                logService.save(enemy.username,ActivityType.STOP);
            }
               
            player = playerService.incKill(player);

            // 리얼타임 랭킹 기록
            rankerService.updateRealtimeRank(player);

            simpMessagingTemplate.convertAndSend("/topic/game/deleteSlime",
                    enemy.username);
            simpMessagingTemplate.convertAndSend("/topic/game/ranker",
                    rankerService.getAlltimeRank());
            simpMessagingTemplate.convertAndSend("/topic/game/realtimeRanker",
                    rankerService.getRealtimeRank());
            simpMessagingTemplate.convertAndSendToUser(player.username, "/queue/game/incKill", player.totalKill);
        }

        // 승리하거나, 이동했을 때만.
        if (actionType.equals("ATTACK") || actionType.equals("MOVE")) {
            playerService.updatePlayer(player.toBuilder().position(target.name).build());
            redisTemplate.opsForSet().add("lock:cube:" + target.name, "");
        }

        // 같은 속성이거나, 천적을 공격하려 했을 때.
        if (actionType.equals("DRAW") || actionType.equals("FEARED")) {
            redisTemplate.opsForSet().add("lock:cube:" + player.position, "");
        }

        return ActionData.builder()
                .actionType(actionType)
                .username(player.username)
                .direction(direction)
                .target(actionType.equals("DRAW") || actionType.equals("FEARED") ? player.position : target.name)
                .lockTime(lockTime)
                .build();
    }

    /**
     * 큐브에 적이 있는지 없는지 확인.
     * 
     * @param position
     * @return 적이 있다면 PlayerEntity를 반환. 없다면 Null을 반환.
     */
    private PlayerEntity searchEnemy(String position) {

        if (redisTemplate.opsForSet().size("lock:cube:" + position) == 0) {
            return null;
        } else {
            return playerService.findByPosition(position);
        }
    }

}
