package com.sas.server.custom.aspect;

import org.aspectj.lang.annotation.AfterThrowing;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TransactionalLoggingAspect {
    
    // 트랜잭션 메서드에서 발생한 모든 예외를 잡아 로그를 기록
    @AfterThrowing(pointcut = "execution(* com.sas..*(..)) && @annotation(org.springframework.transaction.annotation.Transactional)", throwing = "ex")
    public void logTransactionFailure(Exception ex) {
        log.error("Transaction failed with exception: {}", ex.getMessage(), ex);
    }
}
