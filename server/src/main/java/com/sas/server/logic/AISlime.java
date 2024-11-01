package com.sas.server.logic;

import java.io.Serializable;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.custom.dataType.ActionType;
import com.sas.server.custom.dataType.AttributeType;
import com.sas.server.repository.entity.CubeEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.action.ActionService;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AISlime implements Serializable {

    private final ActionService actionService;
    private final PlayerService playerService;
    private final CubeService cubeService;
    /**
     * 인공지능 슬라임이 자동으로 움직이도록 만든다. 콜백 함수는 해당 인공지능이 멈췄을 때 작동.
     * 
     * @param sessionId
     * @throws NullPoniterException
     */
    public ActionData requestAction(String username) {

        // AI가 더 이상 존재하지 않으면 작동 중지
        if (playerService.ingameByUsername(username) == null) {
            return null;
        }

        ActionData action = actionService.requestAction(ActionType.NOTCLASSIFIED, username, moveAlgorithm(username, 3));

        return action;

    }

    public String moveAlgorithm(String username, int scanRange) {

        PlayerEntity player = playerService.findByUsername(username);
        CubeEntity curPos = cubeService.findByName(player.position);

        Set<CubeEntity> around = cubeService.scanAround(player.position, scanRange);

        Map<String, Integer> weight = new HashMap<>();

        weight.put("left", 0);
        weight.put("right", 0);
        weight.put("up", 0);
        weight.put("down", 0);

        for (CubeEntity cube : around) {

            PlayerEntity enemy = playerService.findByPosition(cube.name);

            int enemyPoint = 0;

            if (enemy != null)
                enemyPoint = enemyEval(player.attr, enemy.attr);

            int itemPoint = itemEval(player.attr, cube.attr);
            int distancePoint = (Math.abs(curPos.posX - cube.posX) + Math.abs(curPos.posY - cube.posY));

            double weightedPoint = (enemyPoint + itemPoint) * Math.pow(0.5, (double) distancePoint - 1);

            if (cube.posX < curPos.posX) {
                weight.put("left", weight.get("left") + (int) weightedPoint);
            }

            if (cube.posX > curPos.posX) {
                weight.put("right", weight.get("right") + (int) weightedPoint);
            }

            if (cube.posY < curPos.posY) {
                weight.put("up", weight.get("up") + (int) weightedPoint);
            }

            if (cube.posY > curPos.posY) {
                weight.put("down", weight.get("down") + (int) weightedPoint);
            }
        }

        if (!curPos.down)
            weight.remove("down");

        if (!curPos.up)
            weight.remove("up");

        if (!curPos.left)
            weight.remove("left");

        if (!curPos.right)
            weight.remove("right");


        return weight.entrySet()
                .stream()
                .max(Comparator.comparingInt(Map.Entry::getValue)) // 값 기준으로 최대값 찾기
                .map(Map.Entry::getKey) // 최대값의 key 추출
                .get(); 

    }

    public int itemEval(AttributeType playerAttr, AttributeType itemAttr) {

        if (itemAttr.equals(playerAttr)) {
            return 3;
        }

        switch (itemAttr) {
            case AttributeType.WATER:
                return playerAttr.equals(AttributeType.FIRE) ? 0 : 5;
            case AttributeType.GRASS:
                return playerAttr.equals(AttributeType.WATER) ? 0 : 5;
            case AttributeType.FIRE:
                return playerAttr.equals(AttributeType.GRASS) ? 0 : 5;
            default:
                return 0;
        }
    }

    public int enemyEval(AttributeType playerAttr, AttributeType enemyAttr) {
        if (enemyAttr.equals(playerAttr)) {
            return 0;
        }

        switch (enemyAttr) {
            case AttributeType.WATER:
                return playerAttr.equals(AttributeType.FIRE) ? -10 : 10;
            case AttributeType.GRASS:
                return playerAttr.equals(AttributeType.WATER) ? -10 : 10;
            case AttributeType.FIRE:
                return playerAttr.equals(AttributeType.GRASS) ? -10 : 10;
            default:
                return 0;
        }
    }

}
