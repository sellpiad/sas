package com.sas.server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import com.sas.server.dto.queue.CreationInfo;
import com.sas.server.service.queue.QueueService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class QueueController {

    private final QueueService queueService;

    @MessageMapping("/queue/register")
    @SendToUser("/queue/queue/register")
    public boolean register(@RequestBody CreationInfo info, SimpMessageHeaderAccessor simpMessageHeaderAccessor) {

        String sessionId = simpMessageHeaderAccessor.getSessionId();

        queueService.registerInQueue(sessionId,info.getNickname(),info.getAttr());

        return true;

    }

}
