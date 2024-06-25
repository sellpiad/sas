package com.sas.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.sas.server.dto.Game.MoveData;
import com.sas.server.dto.Game.RankerDTO;
import com.sas.server.dto.Game.SlimeDTO;
import com.sas.server.service.Ranker.RankerService;
import com.sas.server.service.game.GameService;
import com.sas.server.service.user.UserSerivce;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameController {

    private final GameService gameService;
    private final UserSerivce userService;
    private final RankerService rankerService;

    @MessageMapping("/game/slimes")
    @SendToUser("/queue/game/slimes")
    public Map<String, SlimeDTO> getGameStatus(SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        return gameService.findAllSlimes();
    }

    @MessageMapping("/game/move")
    @SendTo("/topic/game/move")
    public MoveData setMove(@RequestBody String keyDown,
            SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        String sessionId = simpMessageHeaderAccessor.getSessionId();

        return gameService.updateMove(sessionId, keyDown);
    }

    @MessageMapping("/game/ranker")
    @SendToUser("/queue/game/ranker")
    public List<RankerDTO> getRankerList() {

        return rankerService.findAll();
    }

    @EventListener
    private void disconnect(SessionDisconnectEvent event) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        if (userService.findBySessionId(sessionId) != null) {
            gameService.removeAndSave(sessionId);
        }

    }

}
