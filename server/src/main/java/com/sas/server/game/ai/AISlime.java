package com.sas.server.game.ai;

import java.io.Serializable;
import java.util.Random;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.dto.game.ActionData;
import com.sas.server.service.game.GameService;
import com.sas.server.service.player.PlayerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AISlime implements Serializable {

    private final GameService gameService;
    private final PlayerService playerService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    /**
     * 인공지능 슬라임이 자동으로 움직이도록 만든다. 콜백 함수는 해당 인공지능이 멈췄을 때 작동.
     * 
     * @param sessionId
     * @throws NullPoniterException
     */
    public boolean move(String username) {

        // AI가 더 이상 존재하지 않으면 작동 중지
        if(!playerService.existById(username)){
            return false;
        }

        ActionData action = gameService.updateMove(username, randDirection());

        if (action != null) {
            simpMessagingTemplate.convertAndSend("/topic/game/move", action);
            return true;
        }

        return false;
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

}
