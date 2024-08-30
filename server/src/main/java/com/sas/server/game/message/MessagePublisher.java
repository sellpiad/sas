package com.sas.server.game.message;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.util.MessageType;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MessagePublisher {

    private final SimpMessagingTemplate template;

    public void topicPublish(MessageType type, Object payload) {

        if (!type.isExpectedType(payload)) {
            throw new IllegalArgumentException("Invalid message type for " + type + ": " + payload.getClass());
        }

        template.convertAndSend(type.getType(), payload);
    }

    public void queuePublish(String username, MessageType type, Object payload) {

        if (!type.isExpectedType(payload)) {
            throw new IllegalArgumentException("Invalid message type for " + type + ": " + payload.getClass());
        }

        template.convertAndSendToUser(username, type.getType(), payload);
    }

}
