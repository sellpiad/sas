package com.sas.server.custom.aspect;

import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import com.sas.server.custom.annotation.LogAction;
import com.sas.server.service.admin.LogService;

import lombok.RequiredArgsConstructor;

@Aspect
@Component
@RequiredArgsConstructor
public class LogActionAspect {

    private final LogService logService;

    @AfterReturning("@annotation(logAction)")
    public void logAction(LogAction logAction) {
        logService.save(logAction.username(), logAction.ActivityType(), logAction.isAdmin());
    }

}
