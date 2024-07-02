package com.sas.server.dto.Game;

import lombok.Builder;
import lombok.Data;

@Builder(toBuilder = true)
@Data
public class ActionData {
    
    /**
     * NONE, MOVE, BATTLE, CONQUER
     */
    String actionType;

    String target;
        
    /**
     * UP, DOWN, LEFT, RIGHT
     */
    String direction;
    
}
