package com.sas.server.controller.dto.game;

import java.util.Date;

import com.sas.server.custom.dataType.ActionType;
import com.sas.server.custom.dataType.AttributeType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SlimeData {

    @Builder.Default
    ActionType actionType = ActionType.IDLE;
    String username;
    String nickname;
    AttributeType attr;
    String direction;
    String position;
    Date createdTime;
    Date removedTime;
    int buffCount;
    int nuffCount;

}
