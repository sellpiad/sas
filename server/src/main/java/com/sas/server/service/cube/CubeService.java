package com.sas.server.service.cube;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.sas.server.controller.dto.cube.CubeData;
import com.sas.server.custom.dataType.AttributeType;
import com.sas.server.custom.dataType.DurationSet;
import com.sas.server.custom.dataType.MessageType;
import com.sas.server.logic.MessagePublisher;
import com.sas.server.repository.entity.CubeEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.repository.redis.CubeRepository;
import com.sas.server.service.player.pattern.CubePub;
import com.sas.server.service.player.pattern.CubeSub;
import com.sas.server.service.player.pattern.PlayerSub;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CubeService implements PlayerSub, CubePub {

    private final CubeRepository cubeRepo;

    private HashMap<String, ScheduledFuture<?>> conquerQueue = new HashMap<>();

    private final ScheduledExecutorService scheduler;

    private final StringRedisTemplate redisTemplate;

    private final MessagePublisher publisher;

    private List<CubeSub> subscribers = new ArrayList<>();

    public void save(CubeEntity cube) {

        cubeRepo.save(cube);

    }

    public void update(CubeEntity cube) {

        cube = cubeRepo.save(cube);

        CubeData data = CubeData.builder().name(cube.name)
                .posX(cube.posX)
                .posY(cube.posY)
                .attr(cube.attr)
                .build();

        notifyUpdate(data);
    }

    public List<CubeEntity> createCubeSet(int initialSize) {

        int total = initialSize * initialSize;
        List<CubeEntity> cubeSet = new ArrayList<>();

        for (int i = 0; i < total; i++) {

            CubeEntity cube = CubeEntity.builder()
                    .founder("SLIME MASTER")
                    .createdTime(LocalDateTime.now())
                    .order(i)
                    .name("slimebox" + i)
                    .posX(i % initialSize)
                    .posY(i / initialSize)
                    .attr(AttributeType.NORMAL)
                    .build();

            cubeSet.add(cube);
            cubeRepo.save(cube);
        }

        setCubeDirection();

        return cubeSet;
    }

    public void setCubeDirection() {

        Iterator<CubeEntity> cubeSet = cubeRepo.findAll().iterator();

        Set<Integer> posXSet = new HashSet<>();
        Set<Integer> posYSet = new HashSet<>();

        while (cubeSet.hasNext()) {
            CubeEntity cube = cubeSet.next();
            posXSet.add(cube.posX);
            posYSet.add(cube.posY);
        }

        cubeSet = cubeRepo.findAll().iterator();

        while (cubeSet.hasNext()) {

            CubeEntity cube = cubeSet.next();

            // east
            if (posXSet.contains(cube.posX + 1)) {
                if (posYSet.contains(cube.posY)) {
                    cube = cube.toBuilder().right(true).build();
                }
            }

            // west
            if (posXSet.contains(cube.posX - 1)) {
                if (posYSet.contains(cube.posY)) {
                    cube = cube.toBuilder().left(true).build();
                }
            }

            // north
            if (posXSet.contains(cube.posX)) {
                if (posYSet.contains(cube.posY - 1)) {
                    cube = cube.toBuilder().up(true).build();
                }
            }

            // south
            if (posXSet.contains(cube.posX)) {
                if (posYSet.contains(cube.posY + 1)) {
                    cube = cube.toBuilder().down(true).build();
                }
            }

            cubeRepo.save(cube);
        }

    }

    public List<CubeEntity> findAll() {
        return (List<CubeEntity>) cubeRepo.findAll();
    }

    public String getCubeNickname(String cubeId) {

        CubeEntity cube = cubeRepo.findById(cubeId)
                .orElseThrow(() -> new IllegalArgumentException("There's no matched cube."));

        return "slimebox" + cube.order;

    }

    public List<CubeData> findAllCube() {

        Iterator<CubeEntity> cubeSet = cubeRepo.findAll().iterator();
        List<CubeData> cubeDataSet = new ArrayList<>();

        while (cubeSet.hasNext()) {

            CubeEntity cube = cubeSet.next();

            CubeData cubeData = CubeData.builder()
                    .name("slimebox" + cube.order)
                    .posX(cube.posX)
                    .posY(cube.posY)
                    .attr(cube.attr)
                    .build();

            cubeDataSet.add(cubeData);
        }

        Comparator<CubeData> comparator = Comparator.comparingInt(CubeData::getPosY)
                .thenComparing(Comparator.comparingInt(CubeData::getPosX));

        cubeDataSet.sort(comparator);

        return cubeDataSet;
    }

    public CubeEntity findByPosition(int posX, int posY) {

        return cubeRepo.findByPosXAndPosY(posX, posY)
                .orElse(null);

    }

    public CubeEntity findByName(String name) {
        return cubeRepo.findByName(name)
                .orElse(null);

    }

    public CubeEntity findById(String cubeId) {

        if (cubeId.equals("null")) {
            return null;
        }

        return cubeRepo.findById(cubeId)
                .orElseThrow(() -> new NullPointerException("There's no cube. cube id : " + cubeId));

    }

    /**
     * 주위에 존재하는 CubeEntity 반환.
     * 
     * @param name
     * @return
     */
    public Set<CubeEntity> getMovableArea(String name) {

        CubeEntity cube = findByName(name);
        Set<CubeEntity> areas = new HashSet<>();

        areas.add(findByPosition(cube.posX, cube.posY - 1)); // UP
        areas.add(findByPosition(cube.posX, cube.posY + 1)); // DOWN
        areas.add(findByPosition(cube.posX - 1, cube.posY)); // LEFT
        areas.add(findByPosition(cube.posX + 1, cube.posY)); // RIGHT

        areas.remove(null); // null이 들어가있다면 제거.

        return areas;
    }

    /**
     * 주변 큐브 및 리턴.
     * @param position
     * @param range
     * @return
     */
    public Set<CubeEntity> scanAround(String position, int range) {

        CubeEntity target = findByName(position);

        return findAll().stream()
                .filter(cube -> Math.abs(cube.posX - target.posX) <= range
                        && Math.abs(cube.posY - target.posY) <= range)
                .collect(Collectors.toSet());

    }

    /**
     * 출발지와 목적지를 비교하여 방향 알아내기
     * 
     * @param origin
     * @param dest
     */
    public String convertToDirection(CubeEntity origin, CubeEntity dest) {

        int x = origin.posX - dest.posX;
        int y = origin.posY - dest.posY;

        if (x == 1)
            return "left";
        if (x == -1)
            return "right";
        if (y == 1)
            return "up";
        if (y == -1)
            return "down";

        return "down";
    }

    /**
     * 
     * @param curCubeId
     * @param direction
     * @return 매개변수로 받은 cubeId의 direction에 해당하는 곳에 위치한 큐브 엔티티 리턴.
     *         존재하지 않는다면 null 리턴.
     * @throws NoSuchElementException curCubeId에 해당하는 큐브가 존재하지 않을 때.
     * @throws NullPointerException   curCubeId가 null값으로 들어왔을 때.
     */
    public CubeEntity getNextCube(String position, String direction) {

        CubeEntity cube = cubeRepo.findByName(position)
                .orElseThrow(() -> new NullPointerException("Cube Entity not found with " + position));

        int posX = cube.posX;
        int posY = cube.posY;

        switch (direction) {
            case "up":
                posY -= 1;
                break;
            case "down":
                posY += 1;
                break;
            case "left":
                posX -= 1;
                break;
            case "right":
                posX += 1;
                break;
            default:
                return null;
        }

        return cubeRepo.findByPosXAndPosY(posX, posY)
                .orElse(null);
    }

    public Map<Object, Object> getConquerSet() {
        return redisTemplate.opsForHash().entries("conquer");
    }

    /**
     * 유저 속성과 큐브 속성을 비교하여 duration 반환.
     * duration은 현재 큐브에서 frame당 소요 시간.
     * 
     */
    public DurationSet calDuration(AttributeType userAttr, String cube) {

        Object cubeAttr = redisTemplate.opsForHash().get("conquer", cube);

        if (cubeAttr == null || userAttr.equals(cubeAttr))
            return DurationSet.MOVE;

        switch (userAttr) {
            case AttributeType.WATER:
                return cubeAttr.equals(AttributeType.FIRE) ? DurationSet.MOVE_BUFF : DurationSet.MOVE_NUFF;
            case AttributeType.GRASS:
                return cubeAttr.equals(AttributeType.WATER) ? DurationSet.MOVE_BUFF : DurationSet.MOVE_NUFF;
            case AttributeType.FIRE:
                return cubeAttr.equals(AttributeType.GRASS) ? DurationSet.MOVE_BUFF : DurationSet.MOVE_NUFF;
            default:
                return DurationSet.MOVE;
        }

    }

    public void notifyConquest(PlayerEntity player, CubeEntity cube, long milliseconds,
            Runnable afterConquered) {

        ScheduledFuture<?> future = scheduler.schedule(() -> {

            redisTemplate.opsForHash().put("conquer", cube.name, player.attr);

            publisher.topicPublish(MessageType.TOPIC_CONQUER_COMPLETE_FOR_CUBE, CubeData.builder()
                    .name(cube.name)
                    .attr(player.attr)
                    .build());

        }, milliseconds, TimeUnit.MILLISECONDS);

        conquerQueue.put(player.id, future);
    }

    /**
     * 정복 취소 메소드.
     * 
     * @param player
     * @return 유저 앞으로 잡힌 conquer이 없다면 false 리턴, 성공한다면 true 리턴.
     */
    public boolean cancelConquer(PlayerEntity player) {

        ScheduledFuture<?> future = conquerQueue.get(player.id);

        if (future != null) {
            return future.cancel(false);
        }

        return false;
    }

    public boolean checkConquerable(PlayerEntity player, CubeEntity cube) {

        if (player.attr == cube.attr) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 큐브에 랜덤으로 아이템 배치.
     */

    @Scheduled(initialDelay = 5000, fixedDelay = 1000)
    public void deploymentItems() {

        List<CubeEntity> normalCubeSet = cubeRepo.findAllByAttr(AttributeType.NORMAL);

        int size = normalCubeSet.size();
        long total = cubeRepo.count();

        if ((double) size / total > 0.7) {

            int randIndex = new Random(System.currentTimeMillis()).nextInt(normalCubeSet.size());

            CubeEntity cube = normalCubeSet.get(randIndex);

            AttributeType attr = getRandomAttr();

            update(cube.toBuilder().attr(attr).build());

        }
    }

    public AttributeType getRandomAttr() {

        // 난수 생성 셋팅
        Random random = new Random();
        random.setSeed(System.currentTimeMillis());

        switch (random.nextInt(3)) {
            case 0:
                return AttributeType.FIRE;
            case 1:
                return AttributeType.WATER;
            case 2:
                return AttributeType.GRASS;
        }

        return AttributeType.NORMAL;

    }

    /**
     * 플레이어 정보 변경시 알림 받고, 실행되는 메소드들.
     *
     */

    @Override
    public void move(PlayerEntity player) {

    };

    @Override
    public void delete(PlayerEntity player) {
    }

    /**
     * 큐브 옵저버 패턴 메소드 구현 및, 알림 메소드.
     *
     */

    @Override
    public void registerSub(CubeSub subscriber) {
        subscribers.add(subscriber);
    }

    @Override
    public void unregisterSub(CubeSub subscriber) {
        subscribers.remove(subscriber);
    }

    @Override
    public void notifyUpdate(CubeData cube) {
        for (CubeSub cubeSub : subscribers) {
            cubeSub.update(cube);
        }
    };
}
