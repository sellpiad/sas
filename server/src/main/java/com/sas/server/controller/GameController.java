package com.sas.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import com.sas.server.dto.game.ActionData;
import com.sas.server.dto.game.RankerDTO;
import com.sas.server.dto.game.SlimeDTO;
import com.sas.server.service.game.GameService;
import com.sas.server.service.ranker.RankerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameController {

    private final GameService gameService;
    private final RankerService rankerService;

    @MessageMapping("/game/slimes")
    @SendToUser("/queue/game/slimes")
    public Map<String, SlimeDTO> getGameStatus(SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        return gameService.findAllSlimes();

    }

    @MessageMapping("/game/move")
    @SendTo("/topic/game/move")
    public ActionData setMove(@RequestBody String keyDown,
            SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        String username = simpMessageHeaderAccessor.getUser().getName();

        if (gameService.isInGame(username) == null) {
            return null;
        }

        return gameService.updateMove(username, keyDown);
    }

    @MessageMapping("/game/ranker")
    @SendToUser("/queue/game/ranker")
    public List<RankerDTO> getRankerList() {

        return rankerService.getRankerList();
    }

}
