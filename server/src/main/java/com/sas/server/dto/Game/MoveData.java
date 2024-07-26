package com.sas.server.dto.game;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MoveData {
  
    public UUID playerId;
    public String position;
    public String direction;
    public long lockTime;
}
