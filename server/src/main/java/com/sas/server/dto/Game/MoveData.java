package com.sas.server.dto.Game;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MoveData {
  
    public UUID playerId;
    public String position;
    public String direction;
}
