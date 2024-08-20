package com.sas.server.util;

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
    STOP("게임 종료");

    private final String type;

}
