package com.sas.server.controller;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.sas.server.controller.dto.admin.MemberData;
import com.sas.server.repository.entity.CustomUserDetails;
import com.sas.server.repository.entity.LogEntity;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.ai.AIService;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.member.MemberService;
import com.sas.server.service.player.PlayerService;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 전용 컨트롤러
 */

@RestController
@RequiredArgsConstructor
public class AdminContoller {

    private final MemberService memberService;
    private final PlayerService playerService;
    private final LogService logService;
    private final AIService aiService;
    private final CubeService cubeService;

    @GetMapping("/admin/getUserList")
    @ResponseBody
    public List<MemberData> getUserList(@AuthenticationPrincipal CustomUserDetails user) {

        List<MemberData> list = memberService.findAll();

        return playerService.udpateIsPlayingOrNot(list);
    }

    @GetMapping("/admin/getLog")
    public List<LogEntity> getLog(@AuthenticationPrincipal CustomUserDetails user) {
        return logService.findAllByIsAdmin(false);
    }

    @GetMapping("/admin/getAdminLog")
    public List<LogEntity> getAdminLog(@AuthenticationPrincipal CustomUserDetails user) {
        return logService.findAllByIsAdmin(true);
    }

    @GetMapping("/admin/addAI")
    public void addAI(@AuthenticationPrincipal CustomUserDetails user) {

        aiService.addAI();

    }

    /**
     * AI 자동 배치 시작
     * 
     * @param period
     * @param user
     * @return
     */

    @PostMapping("/admin/deployment/ai/run")
    public void startAiDeployment(@RequestParam("Period") long period, @RequestParam("Goal") int goal,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (!aiService.deploymentState()) {
            aiService.deploymentRun(0, period, TimeUnit.MILLISECONDS, goal);
        }

    }   

    /**
     * AI 자동 배치 취소
     * 
     * @param user
     */
    @GetMapping("/admin/deployment/ai/stop")
    public void stopAiDeployment(@AuthenticationPrincipal CustomUserDetails user) {

        if (aiService.deploymentState())
            aiService.deploymentStop();

    }

    /**
     * AI 자동 배치 작동 유무
     * 
     * @param user
     * @return
     */
    @GetMapping("/admin/deployment/ai/state")
    public boolean deploymentAiState(@AuthenticationPrincipal CustomUserDetails user) {

        return aiService.deploymentState();

    }

    /**
     * 아이템 자동 배치 시작
     * 
     * @param user
     */
    @PostMapping("/admin/deployment/item/run")
    public void startItemDeployment(@AuthenticationPrincipal CustomUserDetails user) {

        aiService.deploymentRun(0, 1000, TimeUnit.MILLISECONDS, 0.3);

    }

    @GetMapping("/admin/deployment/item/stop")
    public void stopItemDeployment(@AuthenticationPrincipal CustomUserDetails user) {

        aiService.deploymentStop();

    }

    @GetMapping("/admin/deployment/item/state")
    public boolean deplomentItemState(@AuthenticationPrincipal CustomUserDetails user) {

        return false;

    }

    @PostMapping("/admin/queue/run")
    public void startDeployment(@AuthenticationPrincipal CustomUserDetails user) {

        aiService.deploymentRun(0, 1000, TimeUnit.MILLISECONDS, 0.3);

    }

    @GetMapping("/admin/queue/stop")
    public void stopDeployment(@AuthenticationPrincipal CustomUserDetails user) {

        aiService.deploymentStop();

    }

    @GetMapping("/admin/queue/state")
    public boolean deplomentState(@AuthenticationPrincipal CustomUserDetails user) {

        return false;

    }

    @PostMapping("/admin/searchLog")
    public List<LogEntity> searchLog(@RequestParam String keyword) {

        return logService.findAllByUsername(keyword);
    }

}
