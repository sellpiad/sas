package com.sas.server.game.rule;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.UserEntity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ActionSystem {

    private final StringRedisTemplate redisTemplate;

    /**
     * 플레이어와 큐브 간의 속성에 따른 액션 포인트 충전 속도 조절
     * 
     * @param user
     * @param cube
     * @return locktime
     */
    public long lock(UserEntity user, CubeEntity cube) {

        String userLockkey = "lock:user:" + user.sessionId;
        long lockTime = user.actionPoint * user.rechargingSpeed;

        if (cube.attr.equals(user.attr)) {
            redisTemplate.opsForValue().set(userLockkey, "locked", lockTime, TimeUnit.MILLISECONDS);
            return lockTime;
        }

        switch (cube.attr) {
            case "FIRE":
                lockTime = (long) (user.attr.equals("WATER") ? lockTime * 0.7 : lockTime * 1.5);
                break;
            case "WATER":
                lockTime = (long) (user.attr.equals("GRASS") ? lockTime * 0.7 : lockTime * 1.5);
                break;
            case "GRASS":
                lockTime = (long) (user.attr.equals("FIRE") ? lockTime * 0.7 : lockTime * 1.5);
                break;
            case "NORMAL":
                lockTime = (long) (lockTime * 1.3);
                break;
            default:
                throw new IllegalArgumentException("[lockAction] Unavailable Attribution");
        }

        redisTemplate.opsForValue().set(userLockkey, "locked", lockTime, TimeUnit.MILLISECONDS);

        return lockTime;
    }

    /**
     * 플레이어 액션 언락
     * 
     * @param sessionId
     */
    public void unlock(String sessionId) {
        String userLockkey = "lock:user:" + sessionId;
        redisTemplate.delete(userLockkey);
    }

    /**
     * 플레이어가 현재 액션을 취할 수 있는지, 아닌지.
     * 
     * @param sessionId
     * @return 락이 걸려있지 않다면 false 리턴.
     */
    public Boolean isLocked(String sessionId) {

        String userLockkey = "lock:user:" + sessionId;

        return redisTemplate.opsForValue().get(userLockkey) != null ? true : false;

    }

}
