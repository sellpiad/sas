package com.sas.server.controller.dto.game;

import com.sas.server.custom.dataType.AttributeType;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PlayerCardData {
    AttributeType attr;
    String username;
    String nickname;
    int kill;
}
