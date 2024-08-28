package com.sas.server.util;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ActionType {

    ATTACK("ATTACK"),
    MOVE("MOVE"),
    DRAW("DRAW"),
    LOCKED("LOCKED"),
    LOCKON("LOCKON"),
    FEARED("FEARD");

    private final String actionType;
}
