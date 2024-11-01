package com.sas.server.custom.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.sas.server.custom.dataType.ActivityType;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogAction {
    String username();
    ActivityType ActivityType();
    boolean isAdmin();
}
