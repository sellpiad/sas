package com.sas.server.service.action.strategy;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.custom.dataType.ActionType;
import com.sas.server.custom.dataType.DurationSet;
import com.sas.server.custom.exception.LockAcquisitionException;
import com.sas.server.repository.entity.CubeEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MoveWithAttackStrategy implements ActionStrategy {

    @Override
    @Transactional(rollbackFor = { IllegalStateException.class })
    public ActionData doAction(PlayerEntity player, PlayerEntity enemy, CubeEntity target, PlayerService playerService,
            CubeService cubeService,
            StringRedisTemplate redis) {

        Boolean isLockon = redis.opsForValue().setIfAbsent("lock:action:" + enemy.id, "LOCKED",
                500,
                TimeUnit.MILLISECONDS);

        if (isLockon == null) {
            throw new LockAcquisitionException("Try again");
        }

        playerService.deleteById(enemy.id);
        playerService.killEvent(player);
        player = playerService.moveEvent(player, target.name);

        return ActionData.builder()
                .actionType(ActionType.ATTACK)
                .username(player.id)
                .direction(player.direction)
                .position(target.name)
                .buffCount(player.buffCount)
                .nuffCount(player.nuffCount)
                .removedTime(player.removedTime)
                .duration(DurationSet.ATTACK.getDuration())
                .locktime(calcaulteLocktime(ActionType.ATTACK, DurationSet.ATTACK.getDuration()))
                .build();
    }

}
