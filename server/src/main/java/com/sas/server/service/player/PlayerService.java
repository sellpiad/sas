package com.sas.server.service.player;

import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.sas.server.dto.game.ObserverData;
import com.sas.server.entity.PlayerEntity;
import com.sas.server.repository.PlayerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlayerService {

    private final PlayerRepository repo;

    /**
     * 
     * @param playerId
     * @param nickname
     * @param attr
     */

    public void savePlayer(String username, String nickname, String attr) {

        PlayerEntity player = PlayerEntity.builder()
                .username(username)
                .nickname(nickname)
                .attr(attr)
                .build();

        repo.save(player);
    }

    public void saveAI(PlayerEntity user) {
        repo.save(user);
    }

    public void updatePlayer(PlayerEntity player) {
        repo.save(player);
    }

    public boolean existById(String username) {
        return repo.existsById(username);
    }

    public PlayerEntity ingameById(String username) {

        return repo.findByUsernameAndInQueue(username, false)
                .orElse(null);

    }

    public PlayerEntity findById(String username) {
        return repo.findById(username)
                .orElseThrow(() -> new NullPointerException("PlayerEntity not found with username = " + username));
    }

    public PlayerEntity findByPosition(String position) {
        return repo.findByPosition(position)
                .orElseThrow(() -> new NullPointerException("PlayerEntity not found with position = " + position));
    }

    public List<PlayerEntity> findAllByInQueue() {
        return repo.findAllByInQueue(true);
    }

    public List<PlayerEntity> findAllByInGame() {
        return repo.findAllByInQueue(false);
    }

    public void deleteById(String playerId) {
        repo.deleteById(playerId);
    }

    /**
     * 유저의 킬 횟수 증가
     * 
     * @param playerId
     * @return 갱신한 유저 객체 리턴
     */
    public PlayerEntity incKill(PlayerEntity player) throws NullPointerException {

        PlayerEntity updatedUser = repo.save(player.toBuilder()
                .totalKill(player.totalKill + 1)
                .build());

        return updatedUser;
    }

    public List<PlayerEntity> findAll() {

        List<PlayerEntity> list = (List<PlayerEntity>) repo.findAll();

        return list.isEmpty() ? null : list;

    }

    /**
     * 현재 플레이 중인 유저들 중 랜덤으로 한 명의 정보를 리턴.
     * 
     * @return
     */
    public ObserverData findRandObserver() {

        List<PlayerEntity> list = (List<PlayerEntity>) repo.findAll();

        Random random = new Random();

        random.setSeed(System.currentTimeMillis());

        if (list.size() == 0)
            return null;

        PlayerEntity user = list.get(random.nextInt(list.size()));

        return ObserverData.builder()
                .username(user.username)
                .nickname(user.nickname)
                .position(user.position)
                .attr(user.attr)
                .kill(user.totalKill)
                .conquer(0)
                .build();
    }

    public ObserverData findObserverById(String playerId) {

        PlayerEntity player = repo.findById(playerId)
                .orElseThrow(() -> new NullPointerException("PlayerEntity not found with " + playerId));

        return ObserverData.builder()
                .username(player.username)
                .nickname(player.nickname)
                .position(player.position)
                .attr(player.attr)
                .kill(player.totalKill)
                .conquer(0)
                .build();

    }

    public List<PlayerEntity> findAllAi() {
        return repo.findAllByAi(true);
    }

}
