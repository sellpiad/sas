package com.sas.server.dto.game;

import com.sas.server.util.ActionType;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class ActionData {
    
    /**
     * IDLE, MOVE, ATTACK, CONQUER
     */

    @NotBlank(message = "actionType value cannot be null, empty, and blank.")
    ActionType actionType;

    @NotBlank(message = "username value cannot be null, empty, and blank.")
    String username;
    String target;
        
    /**
     * UP, DOWN, LEFT, RIGHT
     */
    @NotBlank(message = "direction value cannot be null, empty, and blank.")
    String direction;

    public long lockTime;
    public long actionPoint;
    
}
