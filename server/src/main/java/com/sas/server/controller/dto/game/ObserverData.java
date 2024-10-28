package com.sas.server.controller.dto.game;

import com.sas.server.custom.dataType.AttributeType;

import lombok.Builder;
import lombok.Data;
import lombok.NonNull;

@Data
@Builder
public class ObserverData {

    @NonNull
    String username;

    @NonNull
    String nickname;

    String position;

    @NonNull
    AttributeType attr;

    int kill;

    int conquer;

}