package com.sas.server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.sas.server.dao.CustomUserDetails;
import com.sas.server.dto.game.ObserverData;
import com.sas.server.dto.queue.CreationInfo;
import com.sas.server.service.player.PlayerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PlayerController {

    private final PlayerService playerService;

    @MessageMapping("/player/anyObserver")
    @SendTo("/topic/player/anyObserver")
    public ObserverData anyObserver() {
        return playerService.findRandObserver();
    }

    @MessageMapping("/player/findObserver")
    @SendTo("/queue/player/findObserver")
    public ObserverData findObserver(@RequestBody String username) {
        return playerService.findObserverById(username);
    }

    @PostMapping("/player/register")
    @ResponseBody
    public ObserverData register(@RequestBody CreationInfo info, @AuthenticationPrincipal CustomUserDetails user) {

        playerService.savePlayer(user.getUsername(), info.getNickname(), info.getAttr());

        return playerService.findObserverById(user.getUsername());

    }

}
