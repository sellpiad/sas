package com.sas.server.logic;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.player.pattern.PlayerSub;
import com.sas.server.service.player.pattern.TimeBombPub;
import com.sas.server.service.player.pattern.TimeBombSub;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Player의 생성, 변경, 삭제 등의 이벤트를 감시하고 있다가, 관련 이벤트가 발생하면 처리.
 * 이벤트 감지는 Observer Pattern으로 구현.
 * 
 */

@Component
@RequiredArgsConstructor
@Slf4j
public class TimebombSystem implements PlayerSub, TimeBombPub {

    private final ScheduledExecutorService scheduler;

    private Map<String, Future> timebombScheduler = new HashMap<>();
    private List<TimeBombSub> subscribers = new ArrayList<>();

    public void register(String username, long ramainingTime) {

        Future future = scheduler.schedule(() -> notifyBomb(username), ramainingTime, TimeUnit.SECONDS);

        timebombScheduler.put(username, future);
    }

    public void remove(String username) {

        Future future = timebombScheduler.get(username);

        future.cancel(false);

        timebombScheduler.remove(username);
    }

    public void postpone(String username, long time) {

        Future future = timebombScheduler.get(username);

        if (future != null && !future.isCancelled()) {
            future.cancel(false);
            timebombScheduler.remove(username);
            register(username, time);
        }

    }

    /**
     * 시한폭탄 알림 구독
     */
    @Override
    public void registerSub(TimeBombSub subscriber) {
        subscribers.add(subscriber);
    }

    /**
     * 시한폭탄 작동시 알림 보내기
     */
    @Override
    public void notifyBomb(String username) {
        for (TimeBombSub subscriber : subscribers) {
            subscriber.notifyBomb(username);
        }
    }

    /**
     * Player 객체 관련 이벤트 발생시 처리 메소드들
     */

    @Override
    public void postpone(PlayerEntity player) {
        postpone(player.id, (player.removedTime.getTime() - new Date().getTime())/1000);
    }

    @Override
    public void inGame(PlayerEntity player, int totalQueue) {
        register(player.id, 30);
    }

}
