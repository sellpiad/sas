package com.sas.server.custom.dataType;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PlayerStateType {
    
    REGISTER("REGISTER"),
    NOT_IN_GAME("NOTINGAME"),
    IN_GAME("INGAME");

    private final String state;

}
