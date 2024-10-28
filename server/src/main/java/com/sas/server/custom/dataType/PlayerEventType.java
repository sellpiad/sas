package com.sas.server.custom.dataType;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PlayerEventType {

    CREATE("CREATE"),
    INGAME("IN_GAME"),
    MOVE("MOVE"),
    DELETE("DELETE");

    private final String eventType;
}
