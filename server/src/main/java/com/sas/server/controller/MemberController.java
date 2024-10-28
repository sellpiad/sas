package com.sas.server.controller;

import org.springframework.http.HttpRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sas.server.controller.dto.game.UserData;
import com.sas.server.custom.dataType.ActivityType;
import com.sas.server.custom.util.Role;
import com.sas.server.repository.entity.CustomUserDetails;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.member.MemberService;
import com.sas.server.service.player.PlaylogService;
import com.sas.server.service.ranker.RankerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MemberController {

    private final MemberService memberService;
    private final LogService logService;
    private final PlaylogService playlogService;
    private final RankerService rankerService;

    @PostMapping("/signin")
    public String signin(@RequestParam String username, String password,
            @AuthenticationPrincipal CustomUserDetails user) {

        logService.save(username,ActivityType.LOGIN);

        return memberService.getUserAuth(user);
    }

    @GetMapping("/userInfo")
    public UserData userInfo(@AuthenticationPrincipal CustomUserDetails user) {

        int killMax = playlogService.findKillMaxByUsername(user.getUsername());
        String mainAttr = playlogService.findMostFrequentAttrByUsername(user.getUsername());
        int ranking = rankerService.getPlayerRank(user.getUsername());

        return UserData.builder()
                .killMax(killMax)
                .mainAttr(mainAttr)
                .highestRanking(ranking)
                .conquerMax(0)
                .username(user.getUsername())
                .build();
    }

    @GetMapping("/isLogined")
    public String isLogined(@RequestBody HttpRequest request) {
        return null;
    }

    @GetMapping("/signout")
    public Boolean logout() {
        return true;
    }

    @PostMapping("/failed")
    public boolean failed(@RequestParam String username, String password,
            @AuthenticationPrincipal CustomUserDetails user) {
        return false;
    }

    @PostMapping("/signup")
    public boolean signup(@RequestParam String id, String password) {

        memberService.save(id, password, Role.USER);
        logService.save(id, ActivityType.SIGNUP);

        return true;

    }

}
