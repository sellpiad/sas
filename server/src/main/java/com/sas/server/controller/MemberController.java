package com.sas.server.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.esotericsoftware.minlog.Log;
import com.sas.server.dao.CustomUserDetails;
import com.sas.server.service.member.MemberService;

import jakarta.persistence.PostPersist;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/signin")
    public boolean signin(@RequestParam String username, String password, @AuthenticationPrincipal CustomUserDetails user) {
        return true;
    }

    @PostMapping("/failed")
    public boolean failed(@RequestParam String username, String password, @AuthenticationPrincipal CustomUserDetails user) {
        return false;
    }
    

    @PostMapping("/signup")
    public boolean signup(@RequestParam String id, String password) {
        
        memberService.save(id,password);

        return true;

    }
    

}
