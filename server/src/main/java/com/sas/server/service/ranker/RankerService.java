package com.sas.server.service.ranker;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

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

    private final RankerRepository rankerRepo;
    private final StringRedisTemplate redisTemplate;

    private static final String LEADERBOARD_KEY = "leaderboard:";

    public int getPlayerRank(String username) {

        Long ranking = redisTemplate.opsForZSet().reverseRank(LEADERBOARD_KEY, username);

        return (ranking != null) ? ranking.intValue() + 1 : -1;
    }

    public void save(PlayerEntity user) {

        RankerEntity ranker = RankerEntity.builder()
                .playerId(user.username)
                .nickname(user.nickname)
                .attr(user.attr)
                .kill(user.totalKill)
                .build();

        rankerRepo.save(ranker);

        
    }

    public void updatePlayerRank(String username, int kill) {
        // Redis의 Sorted Set에서 플레이어의 순위를 업데이트
        redisTemplate.opsForZSet().add(LEADERBOARD_KEY, username, kill);
    }

    public RankerEntity findById(String username) {
        return rankerRepo.findById(username).orElseGet(null);
    }

    public List<RankerDTO> getRankerList() {

        Iterator<RankerEntity> rankerIter = rankerRepo.findAll().iterator();
        List<RankerDTO> rankerList = new ArrayList<>();

        while (rankerIter.hasNext()) {

            RankerEntity ranker = rankerIter.next();

            RankerDTO rankerDTO = RankerDTO.builder()
                    .attr(ranker.attr)
                    .nickname(ranker.nickname)
                    .kill(ranker.kill)
                    .build();

            rankerList.add(rankerDTO);
        }

        rankerList.sort(Comparator.comparingInt(RankerDTO::getKill).reversed());

        if (rankerList.size() > 100) {
            return rankerList.subList(0, 99);
        }

        return rankerList;
    }
}
