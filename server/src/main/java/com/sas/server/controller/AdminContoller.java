package com.sas.server.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.sas.server.dao.CustomUserDetails;
import com.sas.server.dto.admin.MemberData;
import com.sas.server.entity.LogEntity;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.member.MemberService;
import com.sas.server.service.player.PlayerService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
public class AdminContoller {

    private final MemberService memberService;
    private final PlayerService playerService;
    private final LogService logService;

    @GetMapping("/admin/getUserList")
    @ResponseBody
    public List<MemberData> getUserList(@AuthenticationPrincipal CustomUserDetails user) {

        List<MemberData> list = memberService.findAll();

        return playerService.udpateIsPlayingOrNot(list);
    }

    @GetMapping("/admin/getLog")
    public List<LogEntity> getLog(@AuthenticationPrincipal CustomUserDetails user) {
        return logService.findAll();
    }

    @PostMapping("/admin/searchLog")
    public List<LogEntity> searchLog(@RequestParam String keyword) {
        
        return logService.findAllByUsername(keyword);
    }
    

}
