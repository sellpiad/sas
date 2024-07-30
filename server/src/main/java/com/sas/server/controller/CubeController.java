package com.sas.server.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import com.esotericsoftware.minlog.Log;
import com.sas.server.dto.cube.CubeDAO;
import com.sas.server.service.cube.CubeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class CubeController {
    
    private final CubeService cubeService;

    @MessageMapping("/cube/totalPlayer")
    @SendToUser("/queue/totalPlayer")
    public int getTotalPlayer(SimpMessageHeaderAccessor simpMessageHeaderAccessor){

        String sessionId = simpMessageHeaderAccessor.getSessionId();

        return 0;

    }

    @MessageMapping("/cube/cubeSet")
    @SendToUser("/queue/cube/cubeSet")
    public List<CubeDAO> getCubeSet(SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        return cubeService.findAllCubeDAO();
    }
}
