package com.sas.server.service.action.strategy;

import org.springframework.data.redis.core.StringRedisTemplate;

import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.custom.dataType.ActionType;
import com.sas.server.repository.entity.CubeEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;

public class StuckStrategy implements ActionStrategy {

    @Override
    public ActionData doAction(PlayerEntity player, PlayerEntity enemy, CubeEntity target, PlayerService playerService,
            CubeService cubeService,
            StringRedisTemplate redis) {
        return ActionData.builder()
                .actionType(ActionType.STUCK)
                .username(player.id)
                .direction(player.direction)
                .locktime(calcaulteLocktime(ActionType.STUCK, 0))
                .build();
    }

}
