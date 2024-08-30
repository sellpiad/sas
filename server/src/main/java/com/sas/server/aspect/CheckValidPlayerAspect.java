package com.sas.server.aspect;

import java.security.Principal;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import com.sas.server.annotation.CheckValidPlayer;
import com.sas.server.service.player.PlayerService;

import lombok.RequiredArgsConstructor;

@Aspect
@Component
@RequiredArgsConstructor
public class CheckValidPlayerAspect {

    private final PlayerService playerService;

    @Around("@within(checkValidPlayer)")
    public Object around(ProceedingJoinPoint joinPoint, CheckValidPlayer checkValidPlayer) throws Throwable {

        Object[] args = joinPoint.getArgs();

        SimpMessageHeaderAccessor simpMessageHeaderAccessor = null;
        Principal user = null;

        for (Object arg : args) {
            if (arg instanceof SimpMessageHeaderAccessor) {
                simpMessageHeaderAccessor = (SimpMessageHeaderAccessor) arg;
                break;
            }
        }

        if (simpMessageHeaderAccessor != null)
            user = simpMessageHeaderAccessor.getUser();
        else {
            throw new AccessDeniedException("Unauthorized: 검증에 실패했습니다.");
        }

        if (user == null) {
            throw new AccessDeniedException("Unauthorized: 검증에 실패했습니다.");
        }

        if (playerService.ingameById(user.getName()) == null) {
            throw new AccessDeniedException("Unauthorized: 검증에 실패했습니다.");
        }

        return joinPoint.proceed();

    }

}
