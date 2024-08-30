package com.sas.server.dto.game;

import com.sas.server.util.ActionType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class ActionData {
    
    ActionType actionType;

    String username;
    String target;
        
    String direction;

    long lockTime;
    long actionPoint;
    
}
