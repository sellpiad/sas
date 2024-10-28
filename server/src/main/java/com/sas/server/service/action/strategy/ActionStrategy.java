package com.sas.server.service.action.strategy;

import org.springframework.data.redis.core.StringRedisTemplate;

import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.custom.dataType.ActionType;
import com.sas.server.custom.dataType.DurationSet;
import com.sas.server.repository.entity.CubeEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;

/**
 * 액션 전략 기본 인터페이스.
 */

public interface ActionStrategy {

    public ActionData doAction(PlayerEntity player,
            PlayerEntity enemy,
            CubeEntity target,
            PlayerService playerService,
            CubeService cubeService,
            StringRedisTemplate redis);

    default int calcaulteLocktime(ActionType actionType, long duration) {

        switch (actionType) {
            case ActionType.ATTACK:
                return 300 + ((int) duration * 2);
            case ActionType.MOVE:
                return 300 + ((int) duration * 2);
            case ActionType.STUCK:
                return 300;
            case ActionType.DRAW:
                return 300;
            case ActionType.FEARED:
                return 300;
            case ActionType.CONQUER_START:
                return 100;
            case ActionType.CONQUER_CANCEL:
                return 100;
            default:
                return 300;
        }
    }

    default int getDuration(PlayerEntity player) {

        int totalCount = player.buffCount - player.nuffCount;

        if (totalCount == 0)
            return DurationSet.MOVE.getDuration();
        else if (totalCount > 0)
            return DurationSet.MOVE_BUFF.getDuration();
        else
            return DurationSet.MOVE_NUFF.getDuration();

    }
}
