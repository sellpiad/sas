package com.sas.server.controller.dto.queue;

import com.sas.server.custom.dataType.AttributeType;

import lombok.Data;

@Data
public class CreationInfo {
    
    AttributeType attr;
    String nickname;

}
