package com.sas.server.listener;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.sas.server.dao.CustomUserDetails;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.game.GameService;
import com.sas.server.util.ActivityType;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomSessionListener implements HttpSessionListener {

    private final SessionRegistry sessionRegistry;
    private final LogService logService;
    private final GameService gameService;

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        log.info("{}", se.getSession().getId());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {

        // HttpSession을 가져옵니다.
        HttpSession session = se.getSession();

        // SecurityContext를 가져옵니다.
        SecurityContext securityContext = (SecurityContext) session.getAttribute("SPRING_SECURITY_CONTEXT");

        if (securityContext != null) {
            // Authentication 객체를 가져옵니다.
            Authentication authentication = securityContext.getAuthentication();

            if (authentication != null) {
                // Principal 객체를 가져옵니다.
                CustomUserDetails user = (CustomUserDetails)authentication.getPrincipal();

                // 로그에 기록합니다.
                logService.save(user.getUsername(), ActivityType.LOGOUT);
                gameService.removePlayer(user.getUsername());
            }
        }
    }
}
