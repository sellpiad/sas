package com.sas.server.custom.dataType;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 클라이언트 액션 프레임 당 소요시간.
 */

@Getter
@RequiredArgsConstructor
public enum DurationSet {

    IDLE(300),
    NOT_MOVE(300),
    MOVE(450),
    MOVE_BUFF(200),
    MOVE_NUFF(700),
    ATTACK(450),
    ATTACK_BUFF(200),
    ATTACK_NUFF(700),
    CONQUEL_START(5000),
    CONQUEL_CANCEL(0),
    LOCK(300);

    private final int duration;

}
