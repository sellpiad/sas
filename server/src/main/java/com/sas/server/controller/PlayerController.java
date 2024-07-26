package com.sas.server.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.sas.server.dto.game.ObserverData;
import com.sas.server.dto.game.UserData;
import com.sas.server.service.player.PlayerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PlayerController {

    private final PlayerService playerService;

    @MessageMapping("/player/playerList")
    @SendTo("/topic/player/playerList")
    public List<ObserverData> getPlayerList() {
        return playerService.findAllPlayer();
    }

}
