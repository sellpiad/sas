package com.sas.server.controller.dto.cube;

import com.sas.server.custom.dataType.AttributeType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class CubeData {

    String name;
    AttributeType attr;
    int posX;
    int posY;
    
}
