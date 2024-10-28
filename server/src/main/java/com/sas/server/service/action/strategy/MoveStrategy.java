package com.sas.server.service.action.strategy;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.custom.dataType.ActionType;
import com.sas.server.repository.entity.CubeEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;

public class MoveStrategy implements ActionStrategy {

    @Override
    @Transactional(rollbackFor = { IllegalStateException.class })
    public ActionData doAction(PlayerEntity player, PlayerEntity enemy, CubeEntity target, PlayerService playerService,
            CubeService cubeService,
            StringRedisTemplate redis) {

        int duration = getDuration(player);

        player = playerService.moveEvent(player, target.name);

        return ActionData.builder()
                .actionType(ActionType.MOVE)
                .username(player.id)
                .direction(player.direction)
                .position(target.name)
                .duration(duration)
                .buffCount(player.buffCount)
                .nuffCount(player.nuffCount)
                .removedTime(player.removedTime)
                .locktime(calcaulteLocktime(ActionType.MOVE, duration))
                .build();
    }

   

}
