package com.sas.server.custom.dataType;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ActionType {

    NOTCLASSIFIED("NOTCLASSIFIED"), // 유저 -> 서버 단방향 액션 타입
    IDLE("IDLE"), // 아무것도 하지 않을 때
    STUCK("STUCK"), // 벽과 부딪혔을 때
    ATTACK("ATTACK"), // 공격
    MOVE("MOVE"), // 움직임
    MOVE_BUFF("MOVE_BUFF"), // 버프
    MOVE_NUFF("MOVE_NUFF"), // 너프
    DRAW("DRAW"), // 공격을 시도했지만 무승부여서 움직이지 않을 때
    CONQUER_START("CONQUER_START"), // 한칸 떨어진 큐브 정복 시작
    CONQUER_CANCEL("CONQUER_CANCEL"), // 큐브 정복 취소
    LOCKED("LOCKED"), // 락이 걸려있을 때. 서버 -> 유저 단방향 액션타입
    LOCKON("LOCKON"), // ATTACK 대상으로 지정됐을 때
    FEARED("FEARED"), // 공격을 시도했지만, 천적이어서 움직이지 않을 때
    DENIED("DENIED"); // 액션 불가

    private final String actionType;
}
