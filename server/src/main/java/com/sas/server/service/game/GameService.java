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
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sas.server.dto.Game.ActionData;
import com.sas.server.dto.Game.MoveData;
import com.sas.server.dto.Game.SlimeDTO;
import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.GameEntity;
import com.sas.server.entity.UserEntity;
import com.sas.server.game.message.MessengerBroker;
import com.sas.server.game.rule.ActionSystem;
import com.sas.server.game.rule.BattleSystem;
import com.sas.server.game.rule.MovementSystem;
import com.sas.server.repository.GameRepository;
import com.sas.server.service.Ranker.RankerService;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.queue.QueueService;
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

        try {
            gameRepo.save(game);
        } catch (Exception e) {
            log.error(e.getMessage());
        }

    }

    public boolean isInGame(String sessionId) {

        GameEntity game = findGame();

        Objects.requireNonNull(game.userTable, "[isInGame] game.userTable is null");

        if (game.userTable.get(sessionId) == null) {
            return false;
        }

        return true;

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

        try {
            if (targetCubeId != null)
                game.cubeTable.put(targetCubeId, sessionId);

            if (game.userTable == null)
                game.userTable = new HashMap<>();

            game.userTable.put(sessionId, targetCubeId);

            log.info("[addOnly] {}", sessionId);
        } catch (Exception e) {
            log.info("[addOnly] {}" + e.getMessage());
        }

    }

    /**
     * 유저, 큐브 테이블에서 유저를 삭제. 자체적으로 저장 X
     * 
     * @param game
     * @param sessionId
     */
    public void removeOnly(GameEntity game, String sessionId) {

        Objects.requireNonNull(game, "GameEntity cannot be null");
        Objects.requireNonNull(sessionId, "sessionId cannot be null");

        String currentCubeId = game.userTable.get(sessionId);

        if (currentCubeId != null) {
            game.cubeTable.put(currentCubeId, "null");
            game.userTable.remove(sessionId);
            log.info("[removeOnly] {}", sessionId);
        }

    }

    /**
     * 게임 내 유저, 큐브 테이블에 유저를 추가하고, 자체적으로 업데이트.
     * 
     * @param game         해당 게임
     * @param sessionId    대상 유저
     * @param targetCubeId 이동시키고 싶은 큐브 아이디
     */
    @Transactional
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
    @Transactional
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

    public Map<String, SlimeDTO> findAllSlimes() {

        GameEntity game = findGame();

        if (game == null)
            return null;

        Map<String, String> userTable = game.userTable == null ? new HashMap<>() : game.userTable;

        Map<String, SlimeDTO> slimeSet = new HashMap<>();

        for (Map.Entry<String, String> user : userTable.entrySet()) {

            UserEntity player = userSerivce.findBySessionId(user.getKey());
            CubeEntity cube = cubeService.findById(user.getValue());

            if (player != null && cube != null) {

                SlimeDTO slimeDTO = SlimeDTO.builder()
                        .playerId(player.playerId)
                        .attr(player.attr)
                        .direction(player.direction)
                        .position(cube.name)
                        .build();

                slimeSet.put(player.playerId.toString(), slimeDTO);
            }

        }

        return slimeSet;
    }

    private boolean checkUserTableEmpty(GameEntity game) {

        Map<String, String> cubeTable = game.cubeTable;

        if (cubeTable.values().contains("null"))
            return true;
        else
            return false;

    }

    @Transactional
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
                        if (isInGame(userInQueue.sessionId)) {
                            deletePlayer(userInQueue.sessionId);
                        }

                        playerService.registerPlayer(userInQueue, false, position);

                        UserEntity player = userSerivce.findBySessionId(userInQueue.sessionId);

                        addOnly(game, userInQueue.sessionId, cube.getKey());

                        Set<String> clickable = cubeService.getClickableCubes(cube.getKey());
                        Set<String> conqueredCubes = player.conqueredCubes;

                        SlimeDTO slime = SlimeDTO.builder()
                                .playerId(player.playerId)
                                .attr(player.attr)
                                .direction("down")
                                .position(position)
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
    @Transactional
    public ActionData updateMove(String sessionId, String direction) {

        UserEntity player = userSerivce.findBySessionId(sessionId);

        if (player == null)
            return null;

        if (actionSystem.isLocked(sessionId)) {
            return ActionData.builder()
                    .actionType("IDLE")
                    .direction(direction)
                    .playerId(player.playerId)
                    .build();
        }

        try {
            String lockKey = "lock:game";

            Boolean isGameLocked = lockGame();

            if (isGameLocked != null && isGameLocked) {

                GameEntity game = gameRepo.findById(GAME_ID)
                        .orElseThrow(() -> new NullPointerException("[updateMove] Game Entity not found with id"));

                ActionData action = processMove(game, sessionId, direction);

                gameRepo.save(game);

                return action;

            }
        } catch (NullPointerException e) {
            log.error("[updateMove] {}", e.getMessage());
        } finally {
            unlockGame();
        }

        return null;

    }

    private Boolean lockGame() {
        return redisTemplate.opsForValue().setIfAbsent(lockKey, "locked", 1, TimeUnit.SECONDS);
    }

    private void unlockGame() {
        redisTemplate.delete(lockKey);
    }

    private ActionData processMove(GameEntity game, String sessionId, String direction) {

        UserEntity player;
        String departCubeId;

        try {
            player = userSerivce.findBySessionId(sessionId);
            departCubeId = game.userTable.get(sessionId);
        } catch (Exception e) {
            log.error("Exception [Error location] : {}", e.getStackTrace()[0]);
            throw new NullPointerException("userTable");
        }

        // 이동 가능한지 판별
        CubeEntity arrivalCube = movementSystem.move(game, player, direction);

        if (arrivalCube == null) {
            CubeEntity departCube = cubeService.findById(departCubeId);

            return ActionData.builder()
                    .actionType("MOVE")
                    .playerId(player.playerId)
                    .direction(direction)
                    .target(departCube.name)
                    .build();
        }

        // 적이 있는지 판별
        UserEntity enemy = searchEnemy(game, arrivalCube.id);

        if (enemy == null) {

            try {
                removeOnly(game, sessionId);
                addOnly(game, sessionId, arrivalCube.id);
            } catch (Exception e) {
                log.error("[processMove-remove and add] {}", e.getMessage());
            }

            long locktime = actionSystem.lock(player, arrivalCube);

            return ActionData.builder()
                    .actionType("MOVE")
                    .playerId(player.playerId)
                    .direction(direction)
                    .target(arrivalCube.name)
                    .lockTime(locktime)
                    .build();
        }

        // 적이 있다면 승패 유무 가리기
        try {

            String judgementMsg;
            long locktime;

            // 승리시
            if (battleSystem.attrJudgment(player.attr, enemy.attr)) {

                removeOnly(game, sessionId);
                addOnly(game, sessionId, arrivalCube.id);

                removeOnly(game, enemy.sessionId);
                userSerivce.deleteById(enemy.sessionId);

                UserEntity winner = playerService.addKillCount(sessionId);

                rankerService.save(winner);

                locktime = actionSystem.lock(player, arrivalCube);

                judgementMsg = player.nickname + "이(가)" + enemy.nickname + "을(를) 사냥했습니다!";

                simpMessagingTemplate.convertAndSend("/topic/game/deleteSlime", enemy.playerId);
                simpMessagingTemplate.convertAndSend("/topic/game/ranker", rankerService.getRankerList());

                // 패배시
            } else {

                removeOnly(game, sessionId);
                userSerivce.deleteById(sessionId);

                UserEntity winner = playerService.addKillCount(enemy.sessionId);

                rankerService.save(winner);

                judgementMsg = enemy.nickname + "이(가)" + player.nickname + "을(를) 사냥했습니다!";

                simpMessagingTemplate.convertAndSend("/topic/game/deleteSlime", player.playerId);
                simpMessagingTemplate.convertAndSend("/topic/game/ranker", rankerService.getRankerList());

                return null;
            }

            ActionData moveData = ActionData.builder()
                    .actionType("ATTACK")
                    .playerId(player.playerId)
                    .target(arrivalCube.name)
                    .direction(direction)
                    .lockTime(locktime)
                    .build();

            simpMessagingTemplate.convertAndSend("/topic/game/chat", judgementMsg);

            return moveData;

        } catch (Exception e) {
            log.error("[processMove-judgement] {}", e.getMessage());
            return null;
        }

    }

    /**
     * 큐브에 적이 있는지 없는지 확인.
     * 
     * @param game
     * @param targetCube
     * @return 적이 있다면 UserEntity를 반환. 없다면 Null을 반환.
     */
    private UserEntity searchEnemy(GameEntity game, String targetCube) throws ClassCastException, NullPointerException {

        Map<String, String> cubeTable = game.cubeTable;

        String enemyId = cubeTable.get(targetCube);

        return userSerivce.findBySessionId(enemyId);

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
