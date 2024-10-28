package com.sas.server.service.action.strategy;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;

import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.custom.exception.LockAcquisitionException;
import com.sas.server.repository.entity.CubeEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;

import lombok.RequiredArgsConstructor;

/**
 * 
 * Strategy Pattern Context.
 * 
 * 필요한 전략과 그에 필요한 정보를 넘겨받고, 이를 처리.
 * 
 */

@RequiredArgsConstructor
public class ActionContext {

    private final ActionStrategy actionStrategy;

    private final PlayerEntity player;
    private final PlayerEntity enemy;
    private final CubeEntity target;

    private final PlayerService playerService;
    private final CubeService cubeService;
    private final StringRedisTemplate redis;

    public ActionData doAction() {

        // 액션락 키 및 설정
        String key = "lock:action:" + player.id;
        Boolean lockAcquired = redis.opsForValue().setIfAbsent(key, "LOCKED", 3000, TimeUnit.MILLISECONDS);

        // 액션락이 존재하지 않는다면 예외 처리
        if (lockAcquired == null || !lockAcquired)
            throw new LockAcquisitionException("Could not acquire lock");

        ActionData actionData = actionStrategy.doAction(player, enemy, target, playerService, cubeService, redis);

        // 결과에 따라 액션락 유효기간 재설정
        redis.opsForValue().getAndExpire(key, actionData.getLocktime(), TimeUnit.MILLISECONDS);

        return actionData;

    }

}
