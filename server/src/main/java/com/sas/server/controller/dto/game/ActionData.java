package com.sas.server.controller.dto.game;

import java.util.Date;

import com.sas.server.custom.dataType.ActionType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class ActionData {
    
    ActionType actionType;

    String username;
    String position;
        
    String direction;

    long locktime;
    long duration;

    int buffCount;
    int nuffCount;
    Date removedTime;
    
}
