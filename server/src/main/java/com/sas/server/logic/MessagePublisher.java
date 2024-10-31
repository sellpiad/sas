package com.sas.server.logic;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.controller.dto.cube.CubeData;
import com.sas.server.controller.dto.game.SlimeData;
import com.sas.server.custom.dataType.MessageType;
import com.sas.server.custom.dataType.PlayerStateType;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.player.pattern.CubeSub;
import com.sas.server.service.player.pattern.PlayerSub;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class MessagePublisher implements PlayerSub, CubeSub {

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

    @Override
    public void delete(PlayerEntity player) {
        topicPublish(MessageType.TOPIC_DELETE, player.id);
        topicPublish(MessageType.TOPIC_LOCKON, player.id);
        queuePublish(player.id, MessageType.QUEUE_PLAYER_STATE, PlayerStateType.NOT_IN_GAME);
    }

    @Override
    public void inGame(PlayerEntity player, int totalQueue) {

        SlimeData slime = SlimeData.builder()
                .username(player.id)
                .nickname(player.nickname)
                .attr(player.attr)
                .direction(player.direction)
                .position(player.position)
                .createdTime(player.createdTime)
                .removedTime(player.removedTime)
                .build();

        queuePublish(player.id, MessageType.QUEUE_PLAYER_STATE, PlayerStateType.IN_GAME);
        topicPublish(MessageType.TOPIC_QUEUE_UPDATE, totalQueue);
        topicPublish(MessageType.TOPIC_ADD, slime);
        

    }

    @Override
    public void update(CubeData cube) {
        topicPublish(MessageType.TOPIC_CUBE_UPDATE, cube);
    }

}
