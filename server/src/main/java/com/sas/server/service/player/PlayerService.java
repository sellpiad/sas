package com.sas.server.service.player;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.sas.server.controller.dto.admin.MemberData;
import com.sas.server.controller.dto.game.SlimeData;
import com.sas.server.custom.dataType.PlayerStateType;
import com.sas.server.logic.MessagePublisher;
import com.sas.server.logic.TimebombSystem;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.repository.redis.PlayerRepository;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.player.pattern.PlayerPub;
import com.sas.server.service.player.pattern.PlayerSub;
import com.sas.server.service.player.pattern.TimeBombSub;
import com.sas.server.service.ranker.RankerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * <strong>Player 객체 관련 비즈니스 로직</strong>
 * 
 * <p>
 * <strong>Player 생성, 변경, 삭제 시 참조 및 로직 실행 파트</strong>
 * </p>
 * 
 * <ul>
 * <li>{@link RankerService}</li>
 * <li>{@link PlaylogService}</li>
 * <li>{@link LogService}</li>
 * <li>{@link MessagePublisher}</li>
 * <li>{@link TimebombSystem}</li>
 * </ul>
 * 
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class PlayerService implements PlayerPub, TimeBombSub {

    private final PlayerRepository repo; // DB 입출력 객체
    private List<PlayerSub> subscribers = new ArrayList<>(); // 플레이어 생성, 삭제, 업데이트 현황 구독리스트

    public PlayerEntity save(PlayerEntity player) {
        return repo.save(player);
    }

    public PlayerEntity updateWithValidCheck(PlayerEntity player) {

        if (new Date().getTime() > player.removedTime.getTime()) {
            throw new IllegalStateException("Player " + player.nickname + " has Already Died! ");
        }

        return repo.save(player);
    }

    public void deleteById(String username) {

        PlayerEntity player = repo.findById(username).orElse(null);

        if (player != null) {
            notifyDelete(player);
            repo.deleteById(username);
        }
    }

    public int getTotalQueue() {
        return findAllByInQueue().size();
    }

    public PlayerEntity ingameByUsername(String username) {

        PlayerEntity player = repo.findById(username).orElse(null);

        if (player == null || player.inQueue) {
            return null;
        } else {
            return player;
        }

    }

    public PlayerStateType getPlayerState(String username) {

        PlayerEntity player = repo.findById(username).orElse(null);

        if (player == null)
            return PlayerStateType.NOT_IN_GAME;
        else if (player.inQueue)
            return PlayerStateType.REGISTER;
        else
            return PlayerStateType.IN_GAME;

    }

    public PlayerEntity findByUsername(String username) {
        return repo.findById(username).orElseThrow(() -> new IllegalStateException("Player has already died."));
    }

    public PlayerEntity findByPosition(String position) {
        return repo.findByPosition(position)
                .orElse(null);
    }

    public List<PlayerEntity> findAllByInQueue() {
        return repo.findAllByInQueue(true);
    }

    public List<PlayerEntity> findAllByInGame() {
        return repo.findAllByInQueue(false);
    }

    public List<MemberData> udpateIsPlayingOrNot(List<MemberData> list) {

        // 현재 플레이 중인 유저 리스트
        List<PlayerEntity> playerList = findAllByInGame();

        // 검색 시간 복잡도를 최소화 하기 위해 HashMap으로 변환
        Map<String, MemberData> memberMap = new HashMap<>();

        for (MemberData member : list) {
            memberMap.put(member.getUsername(), member);
        }

        for (PlayerEntity player : playerList) {

            MemberData member = memberMap.get(player.id);

            if (member != null) {
                memberMap.put(member.getUsername(), member.toBuilder().isPlaying(true).build());
            }
        }

        return new ArrayList<>(memberMap.values());
    }

    public Map<String, SlimeData> findAllSlimes() {

        Map<String, SlimeData> slimeSet = new HashMap<>();

        List<PlayerEntity> playerSet = findAllByInGame();

        for (PlayerEntity player : playerSet) {

            SlimeData slimeData = SlimeData.builder()
                    .username(player.id)
                    .nickname(player.nickname)
                    .attr(player.attr)
                    .direction("down")
                    .position(player.position)
                    .createdTime(player.createdTime)
                    .build();

            slimeSet.put(player.id, slimeData);
        }

        return slimeSet;
    }

        /**
     * Queue를 주기적으로 스캔하여 플레이어를 게임에 투입.
     * 
     * @return {@code PlayerEntity} Player 정보가 담긴 객체.
     *
     */
    public boolean scanQueue(int max) {

        // 난수 생성 셋팅
        Random random = new Random();
        random.setSeed(System.currentTimeMillis());

        // 무작위로 키를 조회.
        // 큐브 번호는 0~(size*size-1)
        // 락이 존재한다면 키번호 수정 후 재시도.
        // 락을 획득했다면 플레이어 투입.

        Iterator<PlayerEntity> waiterItr = findAllByInQueue().iterator();

        while (waiterItr.hasNext()) {

            String position = "slimebox" + random.nextInt(max);

            if (findByPosition(position) == null) {

                PlayerEntity player = waiterItr.next();

                inGameEvent(player, position);

                return true;
            }

        }

        return false;
    }


    /**
     * 유저의 킬 횟수 증가
     * 
     * @param playerId
     * @return 갱신한 유저 객체 리턴
     */
    public PlayerEntity incKill(PlayerEntity player) throws NullPointerException {

        PlayerEntity updatedUser = updateWithValidCheck(player.toBuilder()
                .totalKill(player.totalKill + 1)
                .build());

        return updatedUser;
    }

    /**
     * 유저 수명 연장
     * 
     * @param player
     * @param addTime
     * @return 갱신한 유저 객체 리턴
     */
    public PlayerEntity postponeRemovedTime(PlayerEntity player, int addTime) {

        Calendar calendar = Calendar.getInstance();

        calendar.setTime(player.removedTime);

        calendar.add(Calendar.SECOND, addTime);

        player = player.toBuilder()
                .removedTime(calendar.getTime())
                .build();

        notifyPostpone(player);

        return updateWithValidCheck(player);

    }

    public PlayerEntity buffEvent(PlayerEntity player, int turnCount) {

        player = player.toBuilder() // 버프 카운트 수정
                .buffCount(player.buffCount + turnCount)
                .build();

        return updateWithValidCheck(player);
    }

    public PlayerEntity nuffEvent(PlayerEntity player, int turnCount) {

        player = player.toBuilder() // 버프 카운트 수정
                .nuffCount(player.nuffCount + turnCount)
                .build();

        return updateWithValidCheck(player);
    }

    public void killEvent(PlayerEntity player) {
        incKill(player);
        postponeRemovedTime(player, 10);

    }

    public PlayerEntity moveEvent(PlayerEntity player, String position) {
        return updateWithValidCheck(player.toBuilder().position(position)
                .buffCount(player.buffCount > 0 ? player.buffCount - 1 : 0)
                .nuffCount(player.nuffCount > 0 ? player.nuffCount - 1 : 0)
                .build());

    }

    public PlayerEntity inGameEvent(PlayerEntity player, String position) {

        // 현재 시간에서 10초 추가
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.add(Calendar.SECOND, 30);

        player = player.toBuilder()
                .inQueue(false)
                .position(position)
                .createdTime(new Date())
                .removedTime(calendar.getTime())
                .build();

        save(player);

        notifyInGame(player, getTotalQueue());

        return player;

    }

    @Override
    public void registerSub(PlayerSub subscriber) {
        subscribers.add(subscriber);
    }

    @Override
    public void unregisterSub(PlayerSub subscriber) {
        subscribers.remove(subscriber);
    }

    @Override
    public void notifyUpdate(PlayerEntity player) {
        for (PlayerSub subscriber : subscribers) {
            subscriber.update(player);
        }
    }

    @Override
    public void notifyDelete(PlayerEntity player) {
        for (PlayerSub subscriber : subscribers) {
            subscriber.delete(player);
        }
    }

    @Override
    public void notifyPostpone(PlayerEntity player) {
        for (PlayerSub subscriber : subscribers) {
            subscriber.postpone(player);
        }
    }

    @Override
    public void notifyMove(PlayerEntity player) {
        for (PlayerSub subscriber : subscribers) {
            subscriber.move(player);
        }
    }

    @Override
    public void notifyInGame(PlayerEntity player, int totalQueue) {
        for (PlayerSub subscriber : subscribers) {
            subscriber.inGame(player,totalQueue);
        }
    }

    /**
     * 시한폭탄이 작동되었을 때 알림을 받고, 유저 삭제.
     * 
     * @param username
     */
    @Override
    public void notifyBomb(String username) {
        deleteById(username);
    }


}
