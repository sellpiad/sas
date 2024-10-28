package com.sas.server.custom.dataType;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AttributeType {

    NORMAL("NORMAL"),
    GRASS("GRASS"),
    WATER("WATER"),
    FIRE("FIRE");
    
    private final String type;


}
