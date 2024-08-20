package com.sas.server.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.sas.server.dao.CustomUserDetails;
import com.sas.server.dto.game.ObserverData;
import com.sas.server.dto.queue.CreationInfo;
import com.sas.server.entity.PlaylogEntity;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.player.PlaylogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Controller
@RequiredArgsConstructor
@Slf4j
public class PlayerController {

    private final PlayerService playerService;
    private final PlaylogService playlogService;

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

    @GetMapping("/player/playlog")
    @ResponseBody
    public List<PlaylogEntity> getPlaylog(@AuthenticationPrincipal CustomUserDetails user) {

        List<PlaylogEntity> list = playlogService.findAllByUsername(user.getUsername());

        return list;
    }
    

}
