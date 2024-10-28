package com.sas.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.sas.server.controller.dto.game.PlayerCardData;
import com.sas.server.controller.dto.game.RankerData;
import com.sas.server.controller.dto.game.SlimeData;
import com.sas.server.repository.entity.CustomUserDetails;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.ranker.RankerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class RankerController {

    private final RankerService rankerService;

    @MessageMapping("/game/ranker")
    @SendToUser("/queue/game/ranker")
    public List<RankerData> getRankerList() {

        return rankerService.getAlltimeRank();
    }

    @GetMapping("/game/alltimeRanking")
    @ResponseBody
    public Integer getAlltimeRanking(@AuthenticationPrincipal CustomUserDetails user) {

        return rankerService.getPlayerRank(user.getUsername());
    }

}
