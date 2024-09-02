package com.sas.server.service.action;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.dto.game.CubeAttrData;
import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.PlayerEntity;
import com.sas.server.game.message.MessagePublisher;
import com.sas.server.util.MessageType;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ConquerSystem {

        private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(3,
                        Thread.ofVirtual().factory());
        private final StringRedisTemplate redisTemplate;

        private HashMap<String, ScheduledFuture<?>> conquerQueue = new HashMap<>();

        private final MessagePublisher publisher;

        public Map<Object, Object> getConquerSet() {
                return redisTemplate.opsForHash().entries("conquer");
        }

        public void notifyConquest(PlayerEntity player, CubeEntity cube, long milliseconds,
                        Runnable afterConquered) {

                ScheduledFuture<?> future = scheduler.schedule(() -> {

                        redisTemplate.opsForHash().put("conquer", cube.name, player.attr);

                        publisher.topicPublish(MessageType.TOPIC_CONQUER_COMPLETE, CubeAttrData.builder()
                                        .name(cube.name)
                                        .attr(player.attr)
                                        .build());

                }, milliseconds, TimeUnit.MILLISECONDS);

                conquerQueue.put(player.username, future);

        }

        /**
         * 정복 취소 메소드.
         * 
         * @param player
         * @return 유저 앞으로 잡힌 conquer이 없다면 false 리턴, 성공한다면 true 리턴.
         */
        public boolean cancelConquer(PlayerEntity player) {

                ScheduledFuture<?> future = conquerQueue.get(player.username);

                if (future != null) {
                        return future.cancel(true);
                }

                return false;
        }
}
