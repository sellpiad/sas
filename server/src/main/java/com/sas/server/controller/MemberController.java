package com.sas.server.controller;

import org.springframework.http.HttpRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sas.server.dao.CustomUserDetails;
import com.sas.server.dto.game.UserData;
import com.sas.server.service.member.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/signin")
    public String signin(@RequestParam String username, String password,
            @AuthenticationPrincipal CustomUserDetails user) {

        return user.getUsername();
    }

    @GetMapping("/userInfo")
    public UserData userInfo(@AuthenticationPrincipal CustomUserDetails user) {

        return UserData.builder()
                .killMax(0)
                .mainAttr("test")
                .conquerMax(3)
                .username(user.getUsername())
                .build();
    }

    @GetMapping("/isLogined")
    public String isLogined(@RequestBody HttpRequest request) {
        return null;
    }
    

    @PostMapping("/failed")
    public boolean failed(@RequestParam String username, String password,
            @AuthenticationPrincipal CustomUserDetails user) {
        return false;
    }

    @PostMapping("/signup")
    public boolean signup(@RequestParam String id, String password) {

        memberService.save(id, password);

        return true;

    }

}
