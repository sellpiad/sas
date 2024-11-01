package com.sas.server.custom.dataType;

import java.sql.Date;
import java.util.List;

import com.sas.server.controller.dto.admin.DeployAIState;
import com.sas.server.controller.dto.admin.ScanQueueState;
import com.sas.server.controller.dto.cube.CubeData;
import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.controller.dto.game.CubeAttrData;
import com.sas.server.controller.dto.game.SlimeData;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MessageType {

    TOPIC_ADD(SlimeData.class, "/topic/game/addSlime"),
    TOPIC_DELETE(String.class, "/topic/game/deleteSlime"),

    TOPIC_CUBE_UPDATE(CubeData.class, "/topic/cube/update"),

    TOPIC_QUEUE_UPDATE(Integer.class,"/topic/queue/total"),

    TOPIC_ACTION(ActionData.class,"/topic/action"),
    TOPIC_LOCKON(String.class,"/topic/game/lockon"),
    
    TOPIC_POSTPONE(Date.class,"/topic/game/postponeSlime"),
    TOPIC_CONQUER_START_FOR_CUBE(CubeAttrData.class,"/topic/action/conquer/start"),
    TOPIC_CONQUER_CANCEL_FOR_CUBE(CubeAttrData.class, "/topic/action/conquer/cancel"),
    TOPIC_CONQUER_COMPLETE_FOR_CUBE(CubeAttrData.class,"/topic/action/conquer/complete"),

    TOPIC_RANKER_ALLTIME(List.class,"/topic/game/ranker/alltime"),
    TOPIC_RANKER_REALTIME(List.class,"/topic/game/ranker/realtime"),

    QUEUE_PLAYER_STATE(PlayerStateType.class,"/queue/player/state"),
    QUEUE_INCKILL(Integer.class, "/queue/game/incKill"),

    QUEUE_DEPLOYMENT_AI_STATE(DeployAIState.class,"/queue/admin/deployAiState"),
    QUEUE_SCANNING_PLAYER_STATE(ScanQueueState.class,"queue/admin/scanningPlayerState");


    private final Class<?> expectedType; // 예상되는 클래스 타입
    private final String type; // 메시지 타입

    public boolean isExpectedType(Object value) {
        return expectedType.isInstance(value);
    }
}