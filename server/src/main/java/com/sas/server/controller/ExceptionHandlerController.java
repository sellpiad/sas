package com.sas.server.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import com.sas.server.exception.UserAlreadyExistsException;

@ControllerAdvice
public class ExceptionHandlerController {
    
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleUserAlreadyExistsException(UserAlreadyExistsException ex, WebRequest request) {
        
        Map<String, Object> body = new HashMap<>();

        body.put("status", "error");
        body.put("message", ex.getMessage());
        body.put("field", "username"); 
        
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

}
