package com.sas.server.dto.game;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MoveData {
  
    public String username;
    public String position;
    public String direction;
    public long lockTime;
}
