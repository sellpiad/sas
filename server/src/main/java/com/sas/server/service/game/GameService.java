package com.sas.server.service.game;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import com.sas.server.annotation.DistributedLock;
import com.sas.server.dto.game.ActionData;
import com.sas.server.dto.game.SlimeDTO;
import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.GameEntity;
import com.sas.server.entity.UserEntity;
import com.sas.server.exception.LockAcquisitionException;
import com.sas.server.game.message.MessengerBroker;
import com.sas.server.game.rule.ActionSystem;
import com.sas.server.game.rule.BattleSystem;
import com.sas.server.game.rule.MovementSystem;
import com.sas.server.repository.GameRepository;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.queue.QueueService;
import com.sas.server.service.ranker.RankerService;
import com.sas.server.service.user.UserSerivce;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameRepository gameRepo;
    private final PlayerService playerService;
    private final CubeService cubeService;
    private final QueueService queueService;
    private final UserSerivce userSerivce;
    private final RankerService rankerService;

    private final MovementSystem movementSystem;
    private final BattleSystem battleSystem;
    private final ActionSystem actionSystem;

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final MessengerBroker msgBroker;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private ScheduledFuture<?> scheduledFuture;

    private final StringRedisTemplate redisTemplate;

    private UUID GAME_ID;

    private final String lockKey = "lock:game";

    public UUID getGameId() {
        return GAME_ID;
    }

    public GameEntity createGame(int initialSize, String title, int life, int voteTime) {

        GameEntity game = GameEntity.builder()
                .id(UUID.randomUUID())
                .title(title)
                .life(life)
                .size(initialSize)
                .voteTime(voteTime)
                .userTable(new HashMap<>())
                .build();

        GAME_ID = game.id;
        game.userTable.put("null", "null");

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

    /**
     * 유저 테이블과 큐브 테이블을 교차 검증하여 유저가 게임에 정상적인 상태로 참여 중인지 확인.
     * 
     * @param sessionId
     * @return 플레이어가 현재 위치한 큐브 ID 리턴
     * @throws NullPointerException
     */

    @DistributedLock(key = "lock:game")
    @Retryable(value = { LockAcquisitionException.class }, maxAttempts = 10, backoff = @Backoff(delay = 100))
    public String isInGame(String sessionId) {

        Objects.requireNonNull(sessionId, "[isInGame] sessionId is null");

        GameEntity game = findGame();

        String position = game.userTable.get(sessionId);
        String name = game.cubeTable.get(position);

        if (sessionId.equals(name))
            return cubeService.getCubeNickname(position);

        return null;

    }

    @Recover
    public String recoverIngame(LockAcquisitionException e, String sessionId) {
        
        throw e;

    }

    public void createCubeTable(List<CubeEntity> cubeSet) {

        GameEntity game = findGame();
        Map<String, String> cubeTable = new HashMap<>();

        for (CubeEntity cube : cubeSet) {
            cubeTable.put(cube.id, "null");
        }

        gameRepo.save(game.toBuilder().cubeTable(cubeTable).build());

    }

    /**
     * 유저, 큐브 테이블에 유저를 추가. 자체적으로 업데이트 X.
     * 
     * @param game
     * @param sessionId
     * @param targetCubeId
     */
    public void addOnly(GameEntity game, String sessionId, String targetCubeId) {

        Objects.requireNonNull(game, "GameEntity cannot be null");
        Objects.requireNonNull(sessionId, "sessionId cannot be null");
        Objects.requireNonNull(targetCubeId, "targetCubeId cannot be null");

        game.cubeTable.put(targetCubeId, sessionId);
        game.userTable.put(sessionId, targetCubeId);
    }

    /**
     * 유저, 큐브 테이블에서 유저를 삭제. 자체적으로 저장 X
     * 
     * @param game
     * @param sessionId
     * @throws NullPointerException
     */
    public void removeOnly(GameEntity game, String sessionId) {

        Objects.requireNonNull(game, "GameEntity cannot be null");
        Objects.requireNonNull(sessionId, "sessionId cannot be null");

        String currentCubeId = game.userTable.get(sessionId);

        game.cubeTable.put(currentCubeId, "null");
        game.userTable.remove(sessionId);
    }

    /**
     * 게임 내 유저, 큐브 테이블에 유저를 추가하고, 자체적으로 업데이트.
     * 
     * @param game         해당 게임
     * @param sessionId    대상 유저
     * @param targetCubeId 이동시키고 싶은 큐브 아이디
     */
    public void addAndSave(String sessionId, String targetCubeId) {

        GameEntity game = gameRepo.findById(GAME_ID)
                .orElseThrow(() -> new IllegalArgumentException("Game Entity not found with id"));

        Map<String, String> cubeTable = game.cubeTable;
        Map<String, String> userTable = game.userTable == null ? new HashMap<>() : game.userTable;

        try {

            if (targetCubeId != null) {
                cubeTable.put(targetCubeId, sessionId);
                userTable.put(sessionId, targetCubeId);
            }

            gameRepo.save(game.toBuilder().cubeTable(cubeTable).userTable(userTable).build());
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    /**
     * 게임 내 유저, 큐브 테이블에서 유저를 삭제하고, 그 상태를 자체적으로 업데이트.
     * 
     * @param sessionId
     */
    public void removeAndSave(String sessionId) {

        GameEntity game = gameRepo.findById(GAME_ID)
                .orElseThrow(() -> new IllegalArgumentException("Game Entity not found with id"));

        Map<String, String> cubeTable = game.cubeTable;
        Map<String, String> userTable = game.userTable;

        String currentCubeId;

        try {

            currentCubeId = userTable.get(sessionId);

            if (currentCubeId != null) {
                cubeTable.put(currentCubeId, "null");
                userTable.remove(sessionId);
            }

            remove(game.toBuilder().cubeTable(cubeTable).userTable(userTable).build());
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    private void remove(GameEntity game) {
        gameRepo.save(game);
    }

    @Retryable(value = { LockAcquisitionException.class }, maxAttempts = 15, backoff = @Backoff(delay = 200))
    @DistributedLock(key = "lock:game")
    public Map<String, SlimeDTO> findAllSlimes() {

        GameEntity game = findGame();

        Map<String, String> userTable = game.userTable;

        Map<String, SlimeDTO> slimeSet = new HashMap<>();

        for (Map.Entry<String, String> user : userTable.entrySet()) {

            UserEntity player = !user.getKey().equals("null") ? userSerivce.findBySessionId(user.getKey())
                    : null;
            CubeEntity cube = cubeService.findById(user.getValue());

            if (player != null && cube != null) {

                SlimeDTO slimeDTO = SlimeDTO.builder()
                        .playerId(player.playerId)
                        .attr(player.attr)
                        .direction(player.direction)
                        .target(cube.name)
                        .build();

                slimeSet.put(player.playerId.toString(), slimeDTO);
            }

        }

        return slimeSet;

    }

    @Recover
    public Map<String, SlimeDTO> recover(LockAcquisitionException e) {

        log.error("[FindAllSlimes] 재요청 모두 실패.");

        return null;
    }

    private boolean checkUserTableEmpty(GameEntity game) {

        Map<String, String> cubeTable = game.cubeTable;

        if (cubeTable.values().contains("null"))
            return true;
        else
            return false;

    }

    @DistributedLock(key = "lock:game")
    public void scanQueue() {

        GameEntity game;

        game = gameRepo.findById(GAME_ID)
                .orElseThrow(() -> new NullPointerException("Game Entity not found with id"));

        if (checkUserTableEmpty(game)) {

            Iterator<UserEntity> waitingIter = queueService.findAll().iterator();

            Map<String, String> cubeTable = game.cubeTable;

            for (Map.Entry<String, String> cube : cubeTable.entrySet()) {

                if (cube.getValue().equals("null")) {
                    if (waitingIter.hasNext()) {

                        UserEntity userInQueue = waitingIter.next();
                        String position = cubeService.getCubeNickname(cube.getKey());

                        // 참가하기 전, 기존 슬라임이 존재한다면 삭제.
                        if (isInGame(userInQueue.sessionId) != null) {
                            deletePlayer(userInQueue.sessionId);
                        }

                        playerService.registerPlayer(userInQueue, false, position);

                        UserEntity player = userSerivce.findBySessionId(userInQueue.sessionId);

                        addOnly(game, userInQueue.sessionId, cube.getKey());

                        Set<String> clickable = cubeService.getClickableCubes(cube.getKey());

                        SlimeDTO slime = SlimeDTO.builder()
                                .playerId(player.playerId)
                                .attr(player.attr)
                                .direction("down")
                                .target(position)
                                .build();

                        gameRepo.save(game);

                        simpMessagingTemplate.convertAndSendToUser(userInQueue.sessionId,
                                "/queue/cube/clickable",
                                clickable,
                                msgBroker.createHeaders(userInQueue.sessionId));

                        simpMessagingTemplate.convertAndSendToUser(userInQueue.sessionId,
                                "/queue/player/initialPosition",
                                position,
                                msgBroker.createHeaders(userInQueue.sessionId));

                        simpMessagingTemplate.convertAndSendToUser(userInQueue.sessionId,
                                "/queue/player/ingame",
                                player.playerId,
                                msgBroker.createHeaders(userInQueue.sessionId));

                        simpMessagingTemplate.convertAndSend("/topic/game/addSlime", slime);

                        log.info("scan queue and joining new player");
                    } else {
                        break;
                    }
                }

            }
        }

    }

    /**
     * 
     * @param sessionId
     * @param direction
     * @return MoveData형식으로 슬라임 닉네임, 위치 리턴. 실패시 null
     */
    @Retryable(value = { LockAcquisitionException.class }, maxAttempts = 15, backoff = @Backoff(delay = 200))
    @DistributedLock(key = "lock:game")
    public ActionData updateMove(String sessionId, String direction) {

        UserEntity player = userSerivce.findBySessionId(sessionId);

        if (actionSystem.isLocked(sessionId)) {
            return ActionData.builder()
                    .actionType("LOCKED")
                    .direction(direction)
                    .playerId(player.playerId)
                    .build();
        }

        GameEntity game = gameRepo.findById(GAME_ID)
                .orElseThrow(() -> new NullPointerException("[updateMove] Game Entity not found with id"));

        ActionData action = processMove(game, player, direction);

        gameRepo.save(game);

        return action;

    }

    @Recover
    public ActionData recoverMove(LockAcquisitionException e, String sessionId, String direction) {

        log.error("{}의 moving 메소드가 모두 실패", sessionId);

        UserEntity player = userSerivce.findBySessionId(sessionId);

        return ActionData.builder()
                    .actionType("LOCKED")
                    .direction(direction)
                    .playerId(player.playerId)
                    .build();
    }

    /**
     * 
     * @param game
     * @param sessionId
     * @param direction
     * @return ActionData
     */
    private ActionData processMove(GameEntity game, UserEntity player, String direction) {

        String departCubeId = game.userTable.get(player.sessionId);

        CubeEntity target = cubeService.getNextCube(departCubeId, direction);
        UserEntity enemy = searchEnemy(game, target.id);
        long lockTime = actionSystem.lock(player, target);

        String actionType;

        // 이동 위치가 같은 큐브일 때, 플레이어 스스로가 적이 되는 것 방지
        if (departCubeId.equals(target.id))
            enemy = null;

        // 플레이어를 필드에서 제거.
        removeOnly(game, player.sessionId);

        // 적이 존재하지 않을시 MOVE.
        // 승리했다면 ATTACK
        // 졌다면 DIED
        if (battleSystem.attrJudgment(player, enemy)) {

            actionType = "MOVE";

            if (enemy != null) {
                actionType = "ATTACK";
            }

        } else {
            actionType = "DIED";
        }

        // 전투가 일어났을 때만 반영
        if (actionType.equals("ATTACK") || actionType.equals("DIED")) {

            UserEntity winner = actionType.equals("ATTACK") ? player : enemy;
            UserEntity loser = actionType.equals("ATTACK") ? enemy : player;

            removeOnly(game, loser.sessionId);
            userSerivce.deleteById(loser.sessionId);
            rankerService.save(playerService.addKillCount(winner.sessionId));

            simpMessagingTemplate.convertAndSend("/topic/game/deleteSlime",
                    loser.playerId);
            simpMessagingTemplate.convertAndSend("/topic/game/ranker",
                    rankerService.getRankerList());

        }

        // 승리하거나, 이동했을 때만.
        if (actionType.equals("ATTACK") || actionType.equals("MOVE")) {
            addOnly(game, player.sessionId,target.id);
        }

        return ActionData.builder()
                .actionType(actionType)
                .playerId(player.playerId)
                .direction(direction)
                .target(target.name)
                .lockTime(lockTime)
                .build();
    }

    /**
     * 큐브에 적이 있는지 없는지 확인.
     * 
     * @param game
     * @param targetCube
     * @return 적이 있다면 UserEntity를 반환. 없다면 Null을 반환.
     */
    private UserEntity searchEnemy(GameEntity game, String targetCube) {

        Map<String, String> cubeTable = game.cubeTable;

        String enemyId = cubeTable.get(targetCube);

        return enemyId.equals("null") ? null : userSerivce.findBySessionId(enemyId);

    }

    public void deletePlayer(String sessoinId) {

        GameEntity game;
        UserEntity user;

        try {

            user = userSerivce.findBySessionId(sessoinId);

            game = gameRepo.findById(GAME_ID)
                    .orElseThrow(() -> new NullPointerException("Game Entity not found with id"));

            removeOnly(game, sessoinId);

            simpMessagingTemplate.convertAndSend("/topic/game/deleteSlime", user.playerId);

        } catch (NullPointerException | MessagingException e) {
            log.error("[deletePlayer] {}", e.getMessage());
        }

    }

}
