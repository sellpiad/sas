package com.sas.server.custom.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 유효하지 않는 방법으로 요청이 들어왔을 때를 대비하여 게임에 참여 중인 플레이언지를 검증.
 */

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface CheckValidPlayer {
    
}
