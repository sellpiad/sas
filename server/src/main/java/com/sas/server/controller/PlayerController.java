package com.sas.server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.sas.server.dto.game.ObserverData;
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
    public ObserverData getPlayerList() {
        return playerService.findRandObserver();
    }

}
