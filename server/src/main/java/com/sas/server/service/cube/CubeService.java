package com.sas.server.service.cube;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.sas.server.dto.Cube.CubeDAO;
import com.sas.server.entity.CubeEntity;
import com.sas.server.repository.CubeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CubeService {

    private final CubeRepository cubeRepo;
    private final RedisTemplate<String, String> redisTemplate;

    private final String lockKey = "lock:cube";

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
                    .attr("NORMAL")
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

    public List<CubeEntity> getAllCube() {
        return (List<CubeEntity>) cubeRepo.findAll();
    }

    public String getCubeNickname(String cubeId) {

        CubeEntity cube = cubeRepo.findById(cubeId)
                .orElseThrow(() -> new IllegalArgumentException("There's no matched cube."));

        return "slimebox" + cube.order;

    }

    public List<CubeDAO> findAllCubeDAO() {

        Iterator<CubeEntity> cubeSet = cubeRepo.findAll().iterator();
        List<CubeDAO> cubeDAOSet = new ArrayList<>();

        while (cubeSet.hasNext()) {

            CubeEntity cube = cubeSet.next();

            CubeDAO dao = CubeDAO.builder()
                    .name("slimebox" + cube.order)
                    .posX(cube.posX)
                    .posY(cube.posY)
                    .cornerstone(cube.cornerstone)
                    .founder(cube.founder)
                    .createdTime(cube.createdTime)
                    .attr(cube.attr)
                    .build();

            cubeDAOSet.add(dao);
        }

        Comparator<CubeDAO> comparator = Comparator.comparingInt(CubeDAO::getPosY)
                .thenComparing(Comparator.comparingInt(CubeDAO::getPosX));

        cubeDAOSet.sort(comparator);

        return cubeDAOSet;
    }

    public void save(CubeEntity cube) {

        cubeRepo.save(cube);

    }

    public CubeEntity findByPosition(int posX, int posY) {

        return cubeRepo.findByPosXAndPosY(posX, posY)
                .orElseThrow(() -> new IllegalArgumentException("Wrong cube position!"));

    }

    public CubeEntity findById(String cubeId) {

        if (cubeId.equals("null")) {
            return null;
        }

        return cubeRepo.findById(cubeId)
                .orElseThrow(() -> new NullPointerException("There's no cube. cube id : " + cubeId));

    }

    /**
     * 
     * @param curCubeId
     * @param direction
     * @return 매개변수로 받은 cubeId의 direction에 해당하는 곳에 위치한 큐브 엔티티 리턴.
     *         방향키가 잘못됐다면 null 값을 리턴.
     * @throws NoSuchElementException curCubeId에 해당하는 큐브가 존재하지 않을 때.
     * @throws NullPointerException   curCubeId가 null값으로 들어왔을 때.
     */
    public CubeEntity getNextCube(String curCubeId, String direction) {

        CubeEntity cube = cubeRepo.findById(curCubeId)
                .orElseThrow(() -> new NullPointerException("Cube Entity not found with " + curCubeId));

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

    public Set<String> getClickableCubes(String cubeId) {

        CubeEntity cube = findById(cubeId);
        Set<String> clickable = new HashSet<>();

        if (cube.up)
            clickable.add("slimebox" + findByPosition(cube.posX, cube.posY - 1).order);
        if (cube.down)
            clickable.add("slimebox" + findByPosition(cube.posX, cube.posY + 1).order);
        if (cube.right)
            clickable.add("slimebox" + findByPosition(cube.posX + 1, cube.posY).order);
        if (cube.left)
            clickable.add("slimebox" + findByPosition(cube.posX - 1, cube.posY).order);

        return clickable;
    }

    public void lockCubeSet(List<String> cubeList) {

        for (String cubeId : cubeList) {

            String cubeLockKey = lockKey + ":" + cubeId;

            redisTemplate.opsForValue().set(cubeLockKey, "locked", 500, TimeUnit.MILLISECONDS);
        }
    }

    public void unlockCubeSet(List<String> cubeList) {
        for (String cubeId : cubeList) {

            String cubeLockKey = lockKey + ":" + cubeId;

            redisTemplate.delete(cubeLockKey);
        }
    }

}
