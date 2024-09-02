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

import com.sas.server.dto.game.SlimeDTO;
import com.sas.server.dto.queue.IngameData;
import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.GameEntity;
import com.sas.server.entity.PlayerEntity;
import com.sas.server.exception.LockAcquisitionException;
import com.sas.server.repository.GameRepository;
import com.sas.server.service.action.ActionSystem;
import com.sas.server.service.action.BattleSystem;
import com.sas.server.service.action.ConquerSystem;
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
    private final LogService logService;

    private final SimpMessagingTemplate simpMessagingTemplate;

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
     * Player를 게임에서 영구제거.
     * 
     * @param game
     * @param sessionId
     * @throws NullPointerException
     */
    public void removePlayer(String username) {

        PlayerEntity player = playerService.findById(username);

        String lockKey = "lock:cube:" + player.position;

        redisTemplate.delete(lockKey);
        playerService.deleteById(player.username);
        rankerService.removeRealtimeRank(player.username);
        simpMessagingTemplate.convertAndSend("/topic/game/deleteSlime", player.username);

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

    public PlayerEntity scanQueue() {

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
                if (!player.ai)
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
                simpMessagingTemplate.convertAndSend("/topic/game/realtimeRanker",
                        rankerService.getRealtimeRank());

                return player;
            }

        }

        return null;
    }
}
