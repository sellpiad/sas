package com.sas.server.aspect;

import java.util.concurrent.TimeUnit;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.StringRedisTemplate;
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

    @Around("@annotation(distributedLock)")
    public Object around(ProceedingJoinPoint joinPoint, DistributedLock distributedLock) throws Throwable {

        String lockKey = distributedLock.key();
        long watingTime = distributedLock.watingTime();
        TimeUnit timeUnit = distributedLock.timeUnit();

        boolean lockAcquired = false;

        try {
            lockAcquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", watingTime, timeUnit);
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
