package com.sas.server.controller.dto.game;

import com.sas.server.custom.dataType.AttributeType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RankerData{

    public String nickname;
    public long lifeTime;
    public AttributeType attr;

}