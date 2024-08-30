package com.sas.server.util;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ActionType {

    NOTCLASSIFIED("NOTCLASSIFIED"),
    STUCK("STUCK"),
    ATTACK("ATTACK"),
    MOVE("MOVE"),
    DRAW("DRAW"),
    CONQUER_START("CONQUER_START"),
    CONQUER_CANCEL("CONQUER_CANCEL"),
    LOCKED("LOCKED"),
    LOCKON("LOCKON"),
    FEARED("FEARED");

    private final String actionType;
}
