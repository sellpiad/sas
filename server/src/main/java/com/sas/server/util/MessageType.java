package com.sas.server.util;

import java.util.List;

import com.sas.server.dto.game.ActionData;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MessageType {

    TOPIC_ACTION(ActionData.class,"/topic/game/action"),
    TOPIC_DELETE(String.class, "/topic/game/deleteSlime"),
    TOPIC_LOCKON(String.class,"/topic/game/lockon"),
    TOPIC_ADD(String.class, "/topic/game/addSlime"),
    TOPIC_CONQUER_START(String.class,"/topic/game/conquer/start"),
    TOPIC_CONQUER_CANCEL(String.class, "/topic/game/conquer/cancel"),
    TOPIC_CONQUER_COMPLETE(String.class,"/topic/game/conquer/complete"),
    TOPIC_RANKER_ALLTIME(List.class,"/topic/game/ranker/alltime"),
    TOPIC_RANKER_REALTIME(List.class,"/topic/game/ranker/realtime"),
    QUEUE_INCKILL(Integer.class, "/queue/game/incKill");

    private final Class<?> expectedType; // 예상되는 클래스 타입
    private final String type; // 메시지 타입

    public boolean isExpectedType(Object value) {
        return expectedType.isInstance(value);
    }
}