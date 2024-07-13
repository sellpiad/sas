package com.sas.server.game.ai;

import java.io.Serializable;
import java.util.Objects;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.context.annotation.Scope;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.Exception.LockAcquisitionException;
import com.sas.server.dto.Game.ActionData;
import com.sas.server.service.game.GameService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Scope("prototype")
@RequiredArgsConstructor
@Slf4j
public class AISlime implements Serializable {

    private String sessionId;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    private boolean movable;
    private Runnable remove;

    /**
     * 인공지능 슬라임이 자동으로 움직이도록 만든다. 콜백 함수는 해당 인공지능이 멈췄을 때 작동.
     * 
     * @param sessionId
     * @param afterStop
     * @throws NullPoniterException
     */
    public void run(String sessionId, Runnable afterStop) {

        Objects.requireNonNull(sessionId, "[run] sessionId is null");
        Objects.requireNonNull(afterStop, "[afterStop] afterStop is null");

        this.sessionId = sessionId;
        this.remove = afterStop;
        this.movable = true;

        int initialDelay = (int) (Math.random() * 1000); // 0~1000ms 사이의 랜덤 초기 딜레이
        int moveInterval = (int) (Math.random() * 500) + 1000; // 500~1000ms 사이의 랜덤 이동 간격

        try {
            scheduler.scheduleAtFixedRate(() -> {
                try {
                    moving();
                } catch (LockAcquisitionException e) {
                } catch (Exception e) {
                    log.error("[moving-{}] {}", sessionId, e.getMessage());
                }

            }, initialDelay, moveInterval, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            log.error("[moving-scheduler-{}] {}", sessionId, e.getMessage());
        }
    }

    public void stop() {
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdown();
        }
    }

    private void moving() {

        if (!movable) {
            return;
        }

        if (gameService.isInGame(sessionId) == null) {
            stop();
            remove.run();
            return;
        }

        ActionData action = gameService.updateMove(sessionId, randDirection());

        movable = false;

        scheduler.schedule(() -> {
            this.movable = true;
        }, 500, TimeUnit.MILLISECONDS);

        if (action != null)
            simpMessagingTemplate.convertAndSend("/topic/game/move", action);

    }

    private String randDirection() {

        Random random = new Random();
        random.setSeed(System.currentTimeMillis());

        switch (random.nextInt(3)) {
            case 0:
                return "right";

            case 1:
                return "left";

            case 2:
                return "up";

            case 3:
                return "down";
            default:
                return null;

        }
    }

}
