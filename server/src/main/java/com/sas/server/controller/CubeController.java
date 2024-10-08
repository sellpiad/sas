package com.sas.server.controller;

import java.util.List;
import java.util.Set;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import com.sas.server.dto.cube.CubeDAO;
import com.sas.server.game.rule.ConquerSystem;
import com.sas.server.service.cube.CubeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class CubeController {
    
    private final CubeService cubeService;
    private final ConquerSystem conquerSystem;

    @MessageMapping("/cube/cubeSet")
    @SendToUser("/queue/cube/cubeSet")
    public List<CubeDAO> getCubeSet() {

        return cubeService.findAllCubeDAO();
    }

    @MessageMapping("/cube/conquerSet")
    @SendToUser("/queue/cube/conquerSet")
    public Set<String> getConquerSet(){
        return conquerSystem.getConquerSet();
    }
}
