package com.sas.server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import com.sas.server.service.game.GameService;
import com.sas.server.service.user.UserSerivce;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserSerivce userSerivce;
    private final GameService gameService;

    @MessageMapping("/user/newbie")
    @SendToUser("/queue/user/newbie")
    public boolean newGuest(SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        String sessionId = simpMessageHeaderAccessor.getSessionId();

        userSerivce.createUser(sessionId);

        return true;
    }

    @MessageMapping("/user/initialNick")
    @SendToUser("/queue/user/initialNick")
    public String guestName(SimpMessageHeaderAccessor simpMessageHeaderAccessor) {
        return "GUEST";
    }
}
