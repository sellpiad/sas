package com.sas.server.controller.dto.queue;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IngameData {
    
    String username;
    String position;

}
