package com.sas.server.service.ranker;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.data.redis.core.ZSetOperations.TypedTuple;
import org.springframework.security.access.method.P;
import org.springframework.stereotype.Service;

import com.sas.server.dto.game.PlayerCardData;
import com.sas.server.dto.game.RankerDTO;
import com.sas.server.entity.PlayerEntity;
import com.sas.server.entity.RankerEntity;
import com.sas.server.repository.RankerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RankerService {

    private final StringRedisTemplate stringRedisTemplate;
    private final RedisTemplate<String, RankerEntity> rankerRedisTemplate;
    private final RankerRepository repo;

    private final String LEADERBOARD_ALLTIME_ZSETKEY = "leaderboard:alltime:zset:";
    private final String LEADERBOARD_REALTIME_ZSETKEY = "leaderboard:realtime:zset:";

    private final String LEADERBOARD_ALLTIME_HASHKEY = "leaderboard:alltime:hash:";
    private final String LEADERBOARD_REALTIME_HASHKEY = "leaderboard:realtime:hash:";

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

        // 100위의 점수가 null이거나, 현재 플레이어의 점수가 100위보다 높을 경우에만 저장
        if (rankerOf100th == null || user.totalKill > zSetOps.score(LEADERBOARD_ALLTIME_ZSETKEY, rankerOf100th)) {

            RankerEntity ranker = RankerEntity.builder()
                    .username(user.username)
                    .nickname(user.nickname)
                    .attr(user.attr)
                    .kill(user.totalKill)
                    .build();

            zSetOps.add(LEADERBOARD_ALLTIME_ZSETKEY, ranker.username, ranker.kill);
            hashOps.put(LEADERBOARD_ALLTIME_HASHKEY, ranker.username, ranker);

            // 상위 100위까지만 유지 (100위 밖의 플레이어는 삭제)
            if (rankerOf100th != null) {
                zSetOps.remove(LEADERBOARD_ALLTIME_ZSETKEY, rankerOf100th);
                hashOps.delete(LEADERBOARD_ALLTIME_HASHKEY, rankerOf100th);
            }
        }
    }

    public void updateRealtimeRank(PlayerEntity user) {

        ZSetOperations<String, String> zSetOps = stringRedisTemplate.opsForZSet();
        HashOperations<String, String, RankerEntity> hashOps = rankerRedisTemplate.opsForHash();

        RankerEntity ranker = RankerEntity.builder()
                .username(user.username)
                .nickname(user.nickname)
                .attr(user.attr)
                .kill(user.totalKill)
                .build();

        zSetOps.add(LEADERBOARD_REALTIME_ZSETKEY, user.username, user.totalKill);
        hashOps.put(LEADERBOARD_REALTIME_HASHKEY, ranker.username, ranker);
    }

    public void removeRealtimeRank(String username) {

        ZSetOperations<String, String> zSetOps = stringRedisTemplate.opsForZSet();
        HashOperations<String, String, RankerEntity> hashOps = rankerRedisTemplate.opsForHash();

        // 플레이어를 랭킹에서 제거
        zSetOps.remove(LEADERBOARD_REALTIME_ZSETKEY, username);
        hashOps.delete(LEADERBOARD_REALTIME_HASHKEY, username);

    }

    public List<RankerDTO> getAlltimeRank() {

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

                    return RankerDTO.builder()
                            .attr(ranker.attr)
                            .nickname(ranker.nickname)
                            .kill(ranker.kill)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<PlayerCardData> getRealtimeRank() {

        ZSetOperations<String, String> zSetOps = stringRedisTemplate.opsForZSet();
        HashOperations<String, String, RankerEntity> hashOps = rankerRedisTemplate.opsForHash();

        Set<String> realtimeSet = zSetOps.reverseRange(LEADERBOARD_REALTIME_ZSETKEY, 0, 99);

        if (realtimeSet == null)
            return null;

        Map<String, RankerEntity> rankers = hashOps.entries(LEADERBOARD_REALTIME_HASHKEY);

        return realtimeSet
                .stream()
                .map(username -> {

                    RankerEntity ranker = rankers.get(username);

                    return PlayerCardData.builder()
                            .attr(ranker.attr)
                            .username(ranker.username)
                            .nickname(ranker.nickname)
                            .kill(ranker.kill)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /*
     * public List<RankerDTO> getRealtimeRank(){}
     * 
     * public List<RankerDTO> getRankerList() {
     * 
     * Iterator<RankerEntity> rankerIter = rankerRepo.findAll().iterator();
     * List<RankerDTO> rankerList = new ArrayList<>();
     * 
     * while (rankerIter.hasNext()) {
     * 
     * RankerEntity ranker = rankerIter.next();
     * 
     * RankerDTO rankerDTO = RankerDTO.builder()
     * .attr(ranker.attr)
     * .nickname(ranker.nickname)
     * .kill(ranker.kill)
     * .build();
     * 
     * rankerList.add(rankerDTO);
     * }
     * 
     * rankerList.sort(Comparator.comparingInt(RankerDTO::getKill).reversed());
     * 
     * if (rankerList.size() > 100) {
     * return rankerList.subList(0, 99);
     * }
     * 
     * return rankerList;
     * }
     */
}
