package com.sas.server.service.action.strategy;

import org.springframework.data.redis.core.StringRedisTemplate;

import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.custom.dataType.ActionType;
import com.sas.server.custom.dataType.AttributeType;
import com.sas.server.repository.entity.CubeEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;

public class MoveWithItemStrategy implements ActionStrategy {

    @Override
    public ActionData doAction(PlayerEntity player, PlayerEntity enemy, CubeEntity target, PlayerService playerService,
            CubeService cubeService, StringRedisTemplate redis) {

        int duration = getDuration(player);

        String result = itemLogic(player, target);

        switch (result) {
            case "BUFF":
                player = playerService.buffEvent(player, 3); // 3칸동안 움직임 버프
                player = playerService.postponeRemovedTime(player, 5); // 수명 5초 증가
                break;
            case "NUFF":
                player = playerService.nuffEvent(player, 3); // 3칸동안 움직임 너프
                player = playerService.postponeRemovedTime(player, -5); // 수명 5초 감소
                break;
            case "NORMAL":
                player = playerService.postponeRemovedTime(player, 3); // 수명 5초 증가
            default:
                break;
        }

        player = playerService.moveEvent(player, target.name); // 플레이어 이동 처리

        cubeService.update(target.toBuilder().attr(AttributeType.NORMAL).build()); // 해당 위치 아이템 삭제.

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

    public String itemLogic(PlayerEntity player, CubeEntity target) {

        if (player.attr.equals(target.attr)) {
            return "NORMAL";
        }

        switch (player.attr) {
            case AttributeType.WATER:
                return target.attr.equals(AttributeType.FIRE) ? "BUFF" : "NUFF";
            case AttributeType.GRASS:
                return target.attr.equals(AttributeType.WATER) ? "BUFF" : "NUFF";
            case AttributeType.FIRE:
                return target.attr.equals(AttributeType.GRASS) ? "BUFF" : "NUFF";
            default:
                throw new IllegalArgumentException("Wrong Attribute!");
        }
    }

}
