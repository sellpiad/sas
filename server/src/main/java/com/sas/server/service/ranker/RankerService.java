package com.sas.server.service.ranker;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.sas.server.controller.dto.game.RankerData;
import com.sas.server.repository.RankerRepository;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.repository.entity.RankerEntity;
import com.sas.server.service.player.pattern.PlayerSub;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j

/**
 * Sorted Set으로 자동 정렬을 보장.
 * 
 */

public class RankerService implements PlayerSub {

    private final SimpMessagingTemplate simpMessagingTemplate;

    private final StringRedisTemplate stringRedisTemplate;
    private final RedisTemplate<String, RankerEntity> rankerRedisTemplate;
    private final RankerRepository repo;

    private final String LEADERBOARD_ALLTIME_ZSETKEY = "leaderboard:alltime:zset:";

    private final String LEADERBOARD_ALLTIME_HASHKEY = "leaderboard:alltime:hash:";

    public int getPlayerRank(String username) {

        Long ranking = stringRedisTemplate.opsForZSet().reverseRank(LEADERBOARD_ALLTIME_ZSETKEY, username);

        return (ranking != null) ? ranking.intValue() + 1 : -1;
    }

    // Redis의 Sorted Set에서 플레이어의 순위를 업데이트
    public void updateAlltimeRank(PlayerEntity user) {

        ZSetOperations<String, String> zSetOps = stringRedisTemplate.opsForZSet();
        HashOperations<String, String, RankerEntity> hashOps = rankerRedisTemplate.opsForHash();

        // 현재 100위를 가져옴.
        String rankerOf100th = zSetOps.range(LEADERBOARD_ALLTIME_ZSETKEY, 99, 99)
                .stream()
                .findFirst()
                .orElse(null);

        Double scoreOf100th = null;

        if (rankerOf100th != null)
            scoreOf100th = zSetOps.score(LEADERBOARD_ALLTIME_ZSETKEY, rankerOf100th);

        if (rankerOf100th == null ||
                (new Date().getTime() - user.createdTime.getTime()) > (scoreOf100th != null ? scoreOf100th
                        : Double.NEGATIVE_INFINITY)) {

            RankerEntity ranker = RankerEntity.builder()
                    .username(user.id)
                    .nickname(user.nickname)
                    .attr(user.attr)
                    .lifeTime(new Date().getTime() - user.createdTime.getTime())
                    .build();

            // 새롭게 랭커 추가
            zSetOps.add(LEADERBOARD_ALLTIME_ZSETKEY, ranker.username, ranker.lifeTime);
            hashOps.put(LEADERBOARD_ALLTIME_HASHKEY, ranker.username, ranker);

            // 기존 랭커 삭제
            if (rankerOf100th != null) {
                zSetOps.remove(LEADERBOARD_ALLTIME_ZSETKEY, rankerOf100th);
                hashOps.delete(LEADERBOARD_ALLTIME_HASHKEY, rankerOf100th);
            }
        }
    }

    public List<RankerData> getAlltimeRank() {

        ZSetOperations<String, String> zSetOps = stringRedisTemplate.opsForZSet();
        HashOperations<String, String, RankerEntity> hashOps = rankerRedisTemplate.opsForHash();

        Set<String> alltimeSet = zSetOps.reverseRange(LEADERBOARD_ALLTIME_ZSETKEY, 0, 99);

        if (alltimeSet == null)
            return null;

        Map<String, RankerEntity> rankers = hashOps.entries(LEADERBOARD_ALLTIME_HASHKEY);

        return alltimeSet
                .stream()
                .map(username -> {

                    RankerEntity ranker = rankers.get(username);

                    return RankerData.builder()
                            .attr(ranker.attr)
                            .nickname(ranker.nickname)
                            .lifeTime(ranker.lifeTime)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public void publishAlltimeRanker() {
        simpMessagingTemplate.convertAndSend("/topic/game/ranker",
                getAlltimeRank());

    }

    @Override
    public void delete(PlayerEntity player) {
        updateAlltimeRank(player);
    }

}
