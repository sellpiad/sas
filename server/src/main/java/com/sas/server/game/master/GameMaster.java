package com.sas.server.game.master;

import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.dto.Game.SlimeDTO;
import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.GameEntity;
import com.sas.server.entity.UserEntity;
import com.sas.server.game.ai.AIController;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.game.GameService;
import com.sas.server.service.user.UserSerivce;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class GameMaster {

    private final AIController aiController;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(3);
    private ScheduledFuture<?> scheduledPlaceRandomAI;
    private ScheduledFuture<?> scheduledQueue;

    private final GameService gameService;
    private final CubeService cubeService;
    private final UserSerivce userSerivce;

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void onApplicationEvent(ContextRefreshedEvent event) {

        log.info("Application initialized!");
        log.info("Game Starting...");

        setting();

        aiDeploymentRun(0, 500, TimeUnit.MILLISECONDS, 0.7);
        queueRun(0, 1000, TimeUnit.MILLISECONDS);
    }

    private void setting() {

        log.info("1. Game Setting Progress.");

        GameEntity game = gameService.createGame(10, "TEST", 1, 10);

        List<CubeEntity> cubeSet = cubeService.createCubeSet(game.size);

        gameService.createCubeTable(cubeSet);

    }

    private void queueRun(long initialDelay, long period, TimeUnit unit) {
        // if (scheduledFuture == null || scheduledFuture.isCancelled()) {
        scheduledQueue = scheduler.scheduleAtFixedRate(() -> gameService.scanQueue(), initialDelay, period, unit);

    }

    private void aiDeploymentRun(long initialDelay, long period, TimeUnit unit, double percentage) {
        scheduledPlaceRandomAI = scheduler.scheduleAtFixedRate(() -> {

            String sessionId = aiController.placeRandomAI(percentage);

            UserEntity ai = userSerivce.findBySessionId(sessionId);

            if (gameService.isInGame(sessionId)) {
                SlimeDTO slime = SlimeDTO.builder()
                        .playerId(ai.playerId)
                        .attr(ai.attr)
                        .direction("down")
                        .position(ai.conqueredCubes.iterator().next())
                        .build();

                String msg = slime.playerId + "가 플레이를 시작합니다.";

                messagingTemplate.convertAndSend("/topic/game/addSlime", slime);
                messagingTemplate.convertAndSend("/topic/game/chat", msg);
            }

        },
                initialDelay, period,
                unit);
    }

    private void aiDeploymentStop() {
        if (scheduledPlaceRandomAI != null && !scheduledPlaceRandomAI.isCancelled()) {
            scheduledPlaceRandomAI.cancel(true);
        }
    }

}
