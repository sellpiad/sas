package com.sas.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.sas.server.dao.CustomUserDetails;
import com.sas.server.dto.game.PlayerCardData;
import com.sas.server.dto.game.RankerDTO;
import com.sas.server.dto.game.SlimeDTO;
import com.sas.server.service.game.GameService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.ranker.RankerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameController {

    private final GameService gameService;
    private final PlayerService playerService;
    private final RankerService rankerService;

    @MessageMapping("/game/slimes")
    @SendToUser("/queue/game/slimes")
    public Map<String, SlimeDTO> getGameStatus() {

        return gameService.findAllSlimes();

    }

    @MessageMapping("/game/ranker")
    @SendToUser("/queue/game/ranker")
    public List<RankerDTO> getRankerList() {

        return rankerService.getAlltimeRank();
    }

    @MessageMapping("/game/realtimeRanker")
    @SendToUser("/queue/game/realtimeRanker")
    public List<PlayerCardData> getRealtimeRanker() {

        return rankerService.getRealtimeRank();
    }

    @GetMapping("/game/alltimeRanking")
    @ResponseBody
    public Integer getAlltimeRanking(@AuthenticationPrincipal CustomUserDetails user) {

        return rankerService.getPlayerRank(user.getUsername());
    }

}
