package com.sas.server.service.player;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.sas.server.dto.game.ObserverData;
import com.sas.server.entity.UserEntity;
import com.sas.server.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlayerService {

    private final UserRepository repo;

    public void registerPlayer(UserEntity user, boolean ai, String startCubeNickname) {

        Objects.requireNonNull(user, "UserEntity cannot be null");
        Objects.requireNonNull(ai, "ai cannot be null");
        Objects.requireNonNull(startCubeNickname, "start cube nickname cannot be null");

        Set<String> conqueredCubes = new HashSet<>();

        conqueredCubes.add(startCubeNickname);

        repo.save(user.toBuilder()
                .state("PLAYER")
                .playerId(UUID.randomUUID())
                .ai(ai)
                .nickname(user.nickname)
                .conqueredCubes(conqueredCubes)
                .direction("down")
                .life(0)
                .actionPoint(100)
                .rechargingSpeed(15)
                .build());

    }

    public void update(UserEntity user) {

        repo.findById(user.sessionId).orElseThrow(() -> new IllegalArgumentException("There's no matched user"));

        repo.save(user);
    }

    /**
     * 유저의 킬 횟수 증가
     * 
     * @param sessionId
     * @return 갱신한 유저 객체 리턴
     */
    public UserEntity addKillCount(String sessionId) throws NullPointerException {
        UserEntity user = repo.findById(sessionId)
                .orElseThrow(() -> new NullPointerException("There's no matched user"));

        user.toBuilder().kill(user.kill++).build();

        repo.save(user);

        return user;
    }

    public List<UserEntity> findAll() {

        List<UserEntity> list = repo.findAllByState("PLAYER");

        return list.isEmpty() ? null : list;

    }

    /**
     * 현재 플레이 중인 유저들 중 랜덤으로 한 명의 정보를 리턴.
     * 
     * @return
     */
    public ObserverData findRandObserver() {

        List<UserEntity> list = repo.findAllByState("PLAYER");

        Random random = new Random();

        random.setSeed(System.currentTimeMillis());

        if (list.size() == 0)
            return null;

        UserEntity user = list.get(random.nextInt(list.size()));

        return ObserverData.builder()
                .username(user.nickname)
                .playerId(user.playerId)
                .attr(user.attr)
                .kill(user.kill)
                .conquer(0)
                .build();
    }

    public List<UserEntity> findAllAi() {
        return repo.findAllByAi(true);
    }

}
