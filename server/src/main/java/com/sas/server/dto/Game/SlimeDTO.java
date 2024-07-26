package com.sas.server.dto.game;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SlimeDTO {
    
    public UUID playerId;
    public String attr;
    public String direction;
    public String target;
    
}
