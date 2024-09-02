package com.sas.server.service.action;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.annotation.DistributedLock;
import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.PlayerEntity;
import com.sas.server.exception.LockAcquisitionException;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.player.PlaylogService;
import com.sas.server.service.ranker.RankerService;
import com.sas.server.util.ActivityType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ActionSystem {

    private final StringRedisTemplate redisTemplate;

    private final PlayerService playerService;
    private final RankerService rankerService;
    private final PlaylogService playlogService;
    private final LogService logService;

    private final ConquerSystem conquerSystem;

    /**
     * 플레이어와 큐브 간의 속성에 따른 액션 포인트 충전 속도 조절
     * 
     * @param user
     * @param cube
     * @return locktime
     */
    public long lock(PlayerEntity user, CubeEntity cube) {

        String userLockkey = "lock:user:" + user.username;
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

    @DistributedLock(key = "'lock:action:normal:' + #player.username", watingTime = 980, timeUnit = TimeUnit.MILLISECONDS)
    public boolean doAttack(PlayerEntity player, PlayerEntity enemy, CubeEntity target) {

        // 상대를 락온
        boolean isLockon = redisTemplate.opsForValue().setIfAbsent("lock:lockon:" + enemy.username, "LOCKED", 500,
                TimeUnit.MILLISECONDS);

        if (!isLockon) {
            throw new LockAcquisitionException("Try again");
        }

        // 패배자 삭제 및 리얼타임 랭크에서 삭제, 그 후 올타임 랭크에 기록
        redisTemplate.delete("lock:cube:" + enemy.position);
        playerService.deleteById(enemy.username);
        rankerService.removeRealtimeRank(enemy.username);
        rankerService.updateAlltimeRank(enemy);

        // ai가 아닐때만 플레이 로그 저장
        if (!enemy.ai) {
            playlogService.save(enemy);
            logService.save(enemy.username, ActivityType.STOP);
        }

        player = playerService.incKill(player);

        rankerService.updateRealtimeRank(player);

        doMove(player, target);

        return true;
    }

    @DistributedLock(key = "'lock:action:normal:' + #player.username", watingTime = 980, timeUnit = TimeUnit.MILLISECONDS)
    public boolean doMove(PlayerEntity player, CubeEntity target) {
        
        redisTemplate.delete("lock:cube:" + player.position);
        playerService.updatePlayer(player.toBuilder().position(target.name).build());
        redisTemplate.opsForSet().add("lock:cube:" + target.name, "");

        return true;
    }

    @DistributedLock(key = "'lock:action:normal:' + #player.username", watingTime = 980, timeUnit = TimeUnit.MILLISECONDS)
    public boolean doDraw(PlayerEntity player) {
        return true;
    }

    public boolean doConquer(PlayerEntity player, CubeEntity target) {

        conquerSystem.notifyConquest(player, target, 3000, null);

        return true;
    }

    public boolean cancelConquer(PlayerEntity player) {
        return conquerSystem.cancelConquer(player);
    }
}
