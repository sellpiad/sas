package com.sas.server.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.custom.annotation.CheckValidPlayer;
import com.sas.server.custom.dataType.ActionType;
import com.sas.server.service.action.ActionService;

import lombok.RequiredArgsConstructor;

/**
 * 유저 액션 담당 컨트롤러
 * 
 */

@RestController
@RequiredArgsConstructor
@CheckValidPlayer
public class ActionController {

    private final ActionService actionService;

    @MessageMapping("/action")
    @SendTo("/topic/action")
    public ActionData action(@RequestBody String direction,
            SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        Principal user = simpMessageHeaderAccessor.getUser();

        return actionService.requestAction(ActionType.NOTCLASSIFIED, user.getName(), direction);
    }

    @MessageMapping("/action/conquer/start")
    @SendTo("/topic/action/conquer/start")
    public ActionData conquerStart(@RequestBody String direction,
            SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        Principal user = simpMessageHeaderAccessor.getUser();

        return actionService.requestAction(ActionType.CONQUER_START, user.getName(), direction);
    }

    @MessageMapping("/action/conquer/cancel")
    @SendTo("/topic/action/conquer/cancel")
    public ActionData conquerCancel(@RequestBody String direction,
            SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        Principal user = simpMessageHeaderAccessor.getUser();

        return actionService.requestAction(ActionType.CONQUER_CANCEL, user.getName(), direction);
    }

}
