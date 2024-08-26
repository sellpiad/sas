package com.sas.server.game.master;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.connection.DefaultStringRedisConnection;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.entity.PlayerEntity;
import com.sas.server.exception.LockAcquisitionException;
import com.sas.server.exception.UserAlreadyExistsException;
import com.sas.server.game.ai.AIController;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.game.GameService;
import com.sas.server.service.member.MemberService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.util.Role;

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
    private final PlayerService playerService;
    private final MemberService memberService;

    private final SimpMessagingTemplate messagingTemplate;

    private final StringRedisTemplate redisTemplate;

    @Value("${server.account.admin.id}")
    private String adminId;

    @Value("${server.account.admin.pwd}")
    private String adminPwd;

    @EventListener
    public void onApplicationEvent(ApplicationReadyEvent event) {

        log.info("Application initialized!");
        log.info("Game Starting...");

        clear();
        setting();

        aiDeploymentRun(0, 2000, TimeUnit.MILLISECONDS, 0.1);
        queueRun(0, 1000, TimeUnit.MILLISECONDS);

        // 테스트 아이디
        try {
            memberService.save("test", "1234", Role.USER);
        } catch (UserAlreadyExistsException E) {
            log.info("이미 있는 아이디이므로 추가 X");
        }

        // 어드민 아이디
        try {
            memberService.save(adminId, adminPwd, Role.ADMIN);
        } catch (UserAlreadyExistsException E) {
            log.info("이미 있는 아이디이므로 추가 X");
        }

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

        gameService.createGame(20, "TEST");
        cubeService.createCubeSet(20);

    }

    private void queueRun(long initialDelay, long period, TimeUnit unit) {
        // if (scheduledFuture == null || scheduledFuture.isCancelled()) {
        scheduledQueue = scheduler.scheduleAtFixedRate(() -> {
            try {
                
                PlayerEntity player = gameService.scanQueue();

                if(player != null && player.ai){
                    aiController.action(player.username);
                }

            } catch (NullPointerException | MessagingException e) {
                log.error("[scanQueue] {}", e.getMessage());
            } catch (LockAcquisitionException e) {
            } catch (Exception e) {
                log.error("{}", e.getMessage());
            }

        }, initialDelay, period, unit);

    }

    private void aiDeploymentRun(long initialDelay, long period, TimeUnit unit, double percentage) {
        scheduledPlaceRandomAI = scheduler.scheduleAtFixedRate(() -> {

            try {

                aiController.placeRandomAI(percentage);

            } catch (IllegalArgumentException | NullPointerException | MessagingException e) {
                log.error("[aiDeploymentRun] {}", e.getMessage());
            } catch (LockAcquisitionException e) {

            } catch (Exception e) {
                log.error("[aiDeploymentRun-Exception] {}", e);
            }

        }, initialDelay, period, unit);

    }

    private void aiDeploymentStop() {
        if (scheduledPlaceRandomAI != null && !scheduledPlaceRandomAI.isCancelled()) {
            scheduledPlaceRandomAI.cancel(true);
        }
    }

}
