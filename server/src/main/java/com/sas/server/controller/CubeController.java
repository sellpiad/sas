package com.sas.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import com.sas.server.controller.dto.cube.CubeData;
import com.sas.server.service.cube.CubeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class CubeController {

    private final CubeService cubeService;

    @MessageMapping("/cube/cubeSet")
    @SendToUser("/queue/cube/cubeSet")
    public List<CubeData> getCubeSet() {

        return cubeService.findAllCube();
    }

    @MessageMapping("/cube/conquerSet")
    @SendToUser("/queue/cube/conquerSet")
    public Map<Object, Object> getConquerSet() {
        return cubeService.getConquerSet();
    }
}
