package com.sas.server.game.rule;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.GameEntity;
import com.sas.server.entity.UserEntity;
import com.sas.server.service.cube.CubeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class MovementSystem {

    private final CubeService cubeService;
    private final StringRedisTemplate redisTemplate;

    /**
     * 
     * @param game      현재 참여 중인 게임
     * @param player    이동 대상 플레이어
     * @param direction 이동하고 싶은 방향
     * 
     * @return 해당 방향에 큐브가 존재한다면 그 방향에 위치한 CubeEntity 반환. 아니라면 Null 값. 아직 무브먼트 딜레이가
     *         경과하지 않았어도 Null 값을 리턴.
     */
    public CubeEntity move(GameEntity game, UserEntity player, String direction) {

        Map<String, String> userTable = game.userTable;

        String departCubeId = userTable.get(player.sessionId);

        try {

            CubeEntity arrivalCube = cubeService.getNextCube(departCubeId, direction);

            if (arrivalCube == null) {
                return null;
            } else {
                return arrivalCube;
            }

        } catch (NoSuchElementException | NullPointerException e) {
            log.error("[move] {}", e.getMessage());
            return null;
        }
    }

}
