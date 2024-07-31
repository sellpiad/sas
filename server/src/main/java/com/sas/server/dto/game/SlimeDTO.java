package com.sas.server.dto.game;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SlimeDTO {
    
    public String username;
    public String attr;
    public String direction;
    public String target;
    
}
