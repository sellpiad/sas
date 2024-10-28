package com.sas.server.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.sas.server.controller.dto.game.SlimeData;
import com.sas.server.controller.dto.queue.CreationInfo;
import com.sas.server.custom.dataType.PlayerStateType;
import com.sas.server.repository.entity.CustomUserDetails;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.repository.entity.PlaylogEntity;
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

    @PostMapping("/player/register")
    @ResponseBody
    public int register(@RequestBody CreationInfo info, @AuthenticationPrincipal CustomUserDetails user) {

        String username = user.getUsername();

        // 플레이어가 이미 게임 중이라면 삭제.
        if (playerService.ingameByUsername(username) != null) {
            playerService.deleteById(username);
        }

        PlayerEntity player = PlayerEntity.builder()
                .id(username)
                .nickname(info.getNickname())
                .attr(info.getAttr())
                .build();

        playerService.save(player);

        return playerService.getTotalQueue();
    }

    @MessageMapping("/player/state")
    @SendToUser("/queue/player/state")
    public PlayerStateType getState(SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        Principal user = simpMessageHeaderAccessor.getUser();

        return playerService.getPlayerState(user.getName());
    }

    @MessageMapping("/player/username")
    @SendToUser("/queue/player/username")
    public String getUsername(SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        Principal user = simpMessageHeaderAccessor.getUser();

        return user.getName();
    }

    @GetMapping("/player/playlog")
    @ResponseBody
    public List<PlaylogEntity> getPlaylog(@AuthenticationPrincipal CustomUserDetails user) {

        List<PlaylogEntity> list = playlogService.findAllByUsername(user.getUsername());

        return list;
    }

    @MessageMapping("/game/slimes")
    @SendToUser("/queue/game/slimes")
    public Map<String, SlimeData> getGameStatus() {

        return playerService.findAllSlimes();

    }

}
