package com.sas.server.game.ai;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.retry.ExhaustedRetryException;
import org.springframework.stereotype.Component;

import com.sas.server.annotation.DistributedLock;
import com.sas.server.entity.GameEntity;
import com.sas.server.entity.UserEntity;
import com.sas.server.exception.LockAcquisitionException;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.game.GameService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.user.UserSerivce;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Component
@Slf4j
public class AIController {

    private final CubeService cubeService;
    private final PlayerService playerService;
    private final GameService gameService;
    private final UserSerivce userSerivce;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(20);
    private Map<String, ScheduledFuture<?>> actionTasks = new ConcurrentHashMap<>();

    private final AISlime aiSlime;

    /**
     * 현재 플레이어 숫자가 전체 큐브 수의 playerPercentage 보다 작다면 AI 투입.
     * 
     * @param playerPercentage
     * @throws IllegalArgumentException
     */
    @DistributedLock(key = "lock:game")
    public UserEntity placeRandomAI(double playerPercentage) {

        GameEntity game = gameService.findGame();

        Map<String, String> cubeTable = game.cubeTable;

        long totalNull = cubeTable.values().stream().filter(value -> value.equals("null")).count();
        int totalCube = cubeTable.size();

        double fraction = (double) totalNull / totalCube;

        if (fraction > playerPercentage) {

            UserEntity ai = createAI();

            List<String> cubekeySet = cubeTable.entrySet()
                    .stream()
                    .filter(entry -> entry.getValue().equals("null"))
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());

            if (cubekeySet.isEmpty()) {
                throw new IllegalArgumentException("There's no cube with null");
            }

            String randCubeId = cubekeySet.get(new Random().nextInt(cubekeySet.size()));

            String cubeNickname = cubeService.getCubeNickname(randCubeId);

            gameService.addOnly(game, ai.sessionId, randCubeId);
            playerService.registerPlayer(ai, true, cubeNickname);

            gameService.saveGame(game);

            return userSerivce.findBySessionId(ai.sessionId);
        }

        return null;

    }

    public void action(String sessionId) {

        int initialDelay = (int) (Math.random() * 1000); // 0~1000ms 사이의 랜덤 초기 딜레이
        int moveInterval = (int) (Math.random() * 500) + 500; // 500~1000ms 사이의 랜덤 이동 간격

        ScheduledFuture<?> future = scheduler.scheduleWithFixedDelay(() -> {

            CompletableFuture.supplyAsync(() -> aiSlime.move(sessionId))
                    .handle((result, ex) -> {
                        if (ex != null) {
                            Throwable cause = ex instanceof CompletionException ? ex.getCause() : ex;
                            if (cause instanceof LockAcquisitionException || cause instanceof ExhaustedRetryException) {
                            } else {
                                
                                throw new CompletionException(cause);
                            }
                        }
                        return result;
                    })
                    .exceptionally(ex -> {
                        // 예외가 발생한 경우 처리 로직

                        log.error("[슬라임 스케줄러] {}", ex.getMessage());

                        return false;

                    })
                    .thenAccept(isAlive -> {
                        if (!isAlive) {
                            log.info("{} has stopped",sessionId);
                            stop(sessionId);
                        }
                    });

        }, initialDelay, moveInterval, TimeUnit.MILLISECONDS);

        actionTasks.put(sessionId, future);
    }

    private void stop(String sessionId) {
        ScheduledFuture<?> future = actionTasks.remove(sessionId);

        if (future != null && !future.isCancelled()) {
            future.cancel(true);
        }
    }

    private UserEntity createAI() {

        UserEntity ai = UserEntity.builder()
                .sessionId(UUID.randomUUID().toString())
                .createdTime(LocalDateTime.now())
                .ai(true)
                .nickname(randNickname())
                .attr(getRandAttr())
                .build();

        return ai;

    }

    private String randNickname() {

        Random random = new Random();

        random.setSeed(System.currentTimeMillis());

        return "Guest" + random.nextInt(100);

    }

    private String getRandAttr() {

        Random random = new Random();

        random.setSeed(System.currentTimeMillis());

        int attr = random.nextInt(3);

        if (attr == 0)
            return "GRASS";
        else if (attr == 1)
            return "WATER";
        else if (attr == 2)
            return "FIRE";

        return null;
    }

}
