package com.sas.server.game.ai;

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

import org.springframework.retry.ExhaustedRetryException;
import org.springframework.stereotype.Component;

import com.sas.server.entity.PlayerEntity;
import com.sas.server.exception.LockAcquisitionException;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.game.GameService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.dto.game.ActionData;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Component
@Slf4j
public class AIController {

    private final CubeService cubeService;
    private final PlayerService playerService;
    private final GameService gameService;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(20);
    private Map<String, ScheduledFuture<?>> actionTasks = new ConcurrentHashMap<>();

    private final AISlime aiSlime;

    /**
     * 현재 플레이어 숫자가 전체 큐브 수의 playerPercentage 보다 작다면 AI 투입.
     * 
     * @param playerPercentage
     * @throws IllegalArgumentException
     */
    public PlayerEntity placeRandomAI(double playerPercentage) {

        int totalPlayer = playerService.findAllByInGame().size();
        int totalCube = cubeService.findAll().size();

        double fraction = (double) totalPlayer / totalCube;

        if (fraction < playerPercentage) {

            PlayerEntity ai = createAI();

            playerService.saveAI(ai);

            return ai;
        }

        return null;

    }

    public void action(String sessionId) {

        int delay = (int) (Math.random() * 200) + 200; // 200ms~400ms 사이의 반응속도

        ActionData action = aiSlime.move(sessionId);

        if(action != null){
            scheduler.schedule(()->action(sessionId), action.lockTime+delay, TimeUnit.MILLISECONDS);
        }

    }

    private void stop(String sessionId) {
        ScheduledFuture<?> future = actionTasks.remove(sessionId);

        if (future != null && !future.isCancelled()) {
            future.cancel(true);
        }
    }

    private PlayerEntity createAI() {

        PlayerEntity ai = PlayerEntity.builder()
                .username(UUID.randomUUID().toString())
                .nickname(randNickname())
                .attr(getRandAttr())
                .ai(true)
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
