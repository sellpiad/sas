package com.sas.server.custom.dataType;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ActivityType {

    SIGNUP("회원가입"),
    LOGIN("로그인"),
    LOGOUT("로그아웃"),
    WRITE("게시글 작성"),
    UPDATE("게시글 업데이트"),
    DELETE("게시글 삭제"),
    PLAY("게임 시작"),
    STOP("게임 종료"),

    /*ADMIN 전용*/
    DEPLOY_AI_RUN("인공지능 자동 배치 시작"),
    DEPLOY_AI_STOP("인공기능 자동 배치 종료"),
    DEPLOY_ITEM_RUN("아이템 자동 배치 시작"),
    DEPLOY_ITEM_STOP("아이템 자동 배치 종료"),
    QUEUE_RUN("플레이어 배치 시작"),
    QUEUE_STOP("플레이어 배치 종료");

    private final String type;

}
