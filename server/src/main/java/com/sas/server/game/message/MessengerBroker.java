package com.sas.server.game.message;

import org.springframework.lang.Nullable;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.stereotype.Component;

@Component
public class MessengerBroker {

    public MessageHeaders createHeaders(@Nullable String sessionId) {

        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);

        if (sessionId != null)
            headerAccessor.setSessionId(sessionId);

        headerAccessor.setLeaveMutable(true);

        return headerAccessor.getMessageHeaders();
    }

}