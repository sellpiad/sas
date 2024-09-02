package com.sas.server.game.ai;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.dto.game.ActionData;
import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.PlayerEntity;
import com.sas.server.service.action.ActionService;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.game.GameService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.util.ActionType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AISlime implements Serializable {

    private final ActionService actionService;
    private final GameService gameService;
    private final PlayerService playerService;
    private final CubeService cubeService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    /**
     * 인공지능 슬라임이 자동으로 움직이도록 만든다. 콜백 함수는 해당 인공지능이 멈췄을 때 작동.
     * 
     * @param sessionId
     * @throws NullPoniterException
     */
    public ActionData requestAction(String username) {

        // AI가 더 이상 존재하지 않으면 작동 중지
        if (!playerService.existById(username)) {
            return null;
        }

        ActionData action = actionService.requestAction(ActionType.NOTCLASSIFIED, username, nextDirection(username));

        if (action != null) {
            simpMessagingTemplate.convertAndSend("/topic/action", action);
            return action;
        }

        return null;
    }

    public String randDirection() {

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
                return "down";

        }
    }

    String nextDirection(String username) {

        PlayerEntity ai = playerService.findById(username);
        CubeEntity origin = cubeService.findByName(ai.position);

        Set<CubeEntity> movableAreas = new HashSet<>();

        // 멍청하지 않다면 벽 감지
        if (!ai.isDumb) {
            movableAreas = cubeService.getMovableArea(origin.name);
        }

        // 친화적이라면 동족 감지
        if (ai.isFriendly) {

        }

        // 방어적이라면 천적 감지
        if (ai.isDefensive) {

        }

        // 공격적이라면 먹이 감지
        if (ai.isAggressive) {

        }

        // 아무것도 없다면 랜덤으로 방향 던지기.
        if (movableAreas.isEmpty()) {
            return randDirection();
        }

        List<CubeEntity> candidates = new ArrayList<>(movableAreas);
        Random random = new Random();

        CubeEntity target = candidates.get(random.nextInt(candidates.size()));

        return cubeService.convertToDirection(origin, target);

    }
}
