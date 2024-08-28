package com.sas.server.aspect;

import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.expression.MethodBasedEvaluationContext;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import com.sas.server.annotation.DistributedLock;
import com.sas.server.exception.LockAcquisitionException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class DistributedLockAspect {

    private final StringRedisTemplate redisTemplate;

    private final ExpressionParser parser = new SpelExpressionParser();
    private final DefaultParameterNameDiscoverer nameDiscoverer = new DefaultParameterNameDiscoverer();

    @Around("@annotation(distributedLock)")
    public Object around(ProceedingJoinPoint joinPoint, DistributedLock distributedLock) throws Throwable {

        MethodSignature signature = (MethodSignature) joinPoint.getSignature(); 
        Method method = signature.getMethod(); 

        String lockKey = distributedLock.key();
        long watingTime = distributedLock.watingTime();
        TimeUnit timeUnit = distributedLock.timeUnit();

        boolean lockAcquired = false;

        //method = 메소드 시그니처 
        //joinPoint.getArgs() = 실제 매개변수 값
        //nameDiscoverer = 메소드 파라미터 이름을 추적할 수 있도록 도와준다. 즉, SpEL에서 파라미터를 사용할 수 있도록 도와준다.
        StandardEvaluationContext context = new MethodBasedEvaluationContext(null, method, joinPoint.getArgs(),
                nameDiscoverer);
        String evaluatedKey = parser.parseExpression(lockKey).getValue(context, String.class);

        try {
            lockAcquired = redisTemplate.opsForValue().setIfAbsent(evaluatedKey, "LOCKED", watingTime, timeUnit);
            if (lockAcquired) {
                return joinPoint.proceed();
            } else {
                throw new LockAcquisitionException("Could not acquire lock");
            }
        } finally {
            if (lockAcquired) {
                redisTemplate.delete(lockKey);
            }
        }
    }

}
