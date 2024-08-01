package com.sas.server.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.concurrent.TimeUnit;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DistributedLock {

    /**
     * 락 이름
     */
    String key(); 

    /**
     * 만료 시간(기본 1000)
     */
    long watingTime() default 1000; 

    /**
     * 타임 유닛(기본 밀리세컨즈)
     */
    TimeUnit timeUnit() default TimeUnit.MILLISECONDS;

}
