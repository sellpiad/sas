package com.sas.server.dto.game;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Builder(toBuilder = true)
@Data
public class ActionData {
    
    /**
     * IDLE, MOVE, ATTACK, CONQUER
     */

    @NotBlank(message = "actionType value cannot be null, empty, and blank.")
    String actionType;

    @NotBlank(message = "username value cannot be null, empty, and blank.")
    String username;
    String target;
        
    /**
     * UP, DOWN, LEFT, RIGHT
     */
    @NotBlank(message = "direction value cannot be null, empty, and blank.")
    String direction;

    public long lockTime;
    
}
