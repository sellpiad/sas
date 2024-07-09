package com.sas.server.game.master;

import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.connection.DefaultStringRedisConnection;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.lang.Nullable;
import org.springframework.messaging.MessagingException;
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

    private final StringRedisTemplate redisTemplate;

    @EventListener
    public void onApplicationEvent(ContextRefreshedEvent event) {

        log.info("Application initialized!");
        log.info("Game Starting...");

        clear();
        setting();

        aiDeploymentRun(0, 500, TimeUnit.MILLISECONDS, 0.9);
        queueRun(0, 1000, TimeUnit.MILLISECONDS);
    }

    private void clear() {
        RedisConnection connection = redisTemplate.getConnectionFactory().getConnection();
        RedisSerializer redisSerializer = redisTemplate.getKeySerializer();
        DefaultStringRedisConnection defaultStringRedisConnection = new DefaultStringRedisConnection(connection,
                redisSerializer);
        defaultStringRedisConnection.flushAll();
    }

    private void setting() {

        log.info("1. Game Setting Progress.");

        GameEntity game = gameService.createGame(10, "TEST", 1, 10);

        List<CubeEntity> cubeSet = cubeService.createCubeSet(game.size);

        gameService.createCubeTable(cubeSet);

    }

    private void queueRun(long initialDelay, long period, TimeUnit unit) {
        // if (scheduledFuture == null || scheduledFuture.isCancelled()) {
        scheduledQueue = scheduler.scheduleAtFixedRate(() -> {
            try {
                gameService.scanQueue();
            } catch (NullPointerException | MessagingException e) {
                log.error("[scanQueue] {}", e.getMessage());
            }

        }, initialDelay, period, unit);

    }

    private void aiDeploymentRun(long initialDelay, long period, TimeUnit unit, double percentage) {
        scheduledPlaceRandomAI = scheduler.scheduleAtFixedRate(() -> {

            String sessionId = aiController.placeRandomAI(percentage);

            try {

                if (sessionId == null)
                    return;

                UserEntity ai = userSerivce.findBySessionId(sessionId);

                if (gameService.isInGame(sessionId)) {
                    SlimeDTO slime = SlimeDTO.builder()
                            .playerId(ai.playerId)
                            .attr(ai.attr)
                            .direction("down")
                            .target(ai.conqueredCubes.iterator().next())
                            .build();

                    String msg = slime.playerId + "가 플레이를 시작합니다.";

                    try {
                        messagingTemplate.convertAndSend("/topic/game/addSlime", slime);
                        messagingTemplate.convertAndSend("/topic/game/chat", msg);
                    } catch (MessagingException e) {
                        log.error("[aiDeploymentRun] {}", e.getMessage());
                    }

                }
            } catch (Exception e) {
                log.error(e.getMessage());
            }

        }, initialDelay, period, unit);
    }

    private void aiDeploymentStop() {
        if (scheduledPlaceRandomAI != null && !scheduledPlaceRandomAI.isCancelled()) {
            scheduledPlaceRandomAI.cancel(true);
        }
    }

}
