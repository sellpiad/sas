package com.sas.server.custom.listener;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.stereotype.Component;

import com.sas.server.custom.dataType.ActivityType;
import com.sas.server.repository.entity.CustomUserDetails;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.player.PlayerService;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomSessionListener implements HttpSessionListener {

    private final LogService logService;
    private final PlayerService playerService;

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        log.info("{}", se.getSession().getId());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {

        HttpSession session = se.getSession();

        SecurityContext securityContext = (SecurityContext) session.getAttribute("SPRING_SECURITY_CONTEXT");

        if (securityContext != null) {
            Authentication authentication = securityContext.getAuthentication();

            if (authentication != null) {
                CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();

                // 로그 기록.
                logService.save(user.getUsername(), ActivityType.LOGOUT);

                // 플레이 중이라면 삭제.
                if (playerService.ingameByUsername(user.getUsername()) != null)
                    playerService.deleteById(user.getUsername());
            }
        }
    }
}
