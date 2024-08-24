package com.sas.server.service.cube;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.sas.server.dto.cube.CubeDAO;
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

    @Cacheable(value = "cubeCache")
    public List<CubeEntity> findAll() {
        return (List<CubeEntity>) cubeRepo.findAll();
    }

    public String getCubeNickname(String cubeId) {

        CubeEntity cube = cubeRepo.findById(cubeId)
                .orElseThrow(() -> new IllegalArgumentException("There's no matched cube."));

        return "slimebox" + cube.order;

    }

    @Cacheable(value = "cubeCache")
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

    @Cacheable(value = "cubeCache")
    public CubeEntity findByPosition(int posX, int posY) {

        return cubeRepo.findByPosXAndPosY(posX, posY)
                .orElse(null);

    }

    @Cacheable(value = "cubeCache")
    public CubeEntity findByName(String name) {
        return cubeRepo.findByName(name)
                .orElse(null);

    }

    @Cacheable(value = "cubeCache")
    public CubeEntity findById(String cubeId) {

        if (cubeId.equals("null")) {
            return null;
        }

        return cubeRepo.findById(cubeId)
                .orElseThrow(() -> new NullPointerException("There's no cube. cube id : " + cubeId));

    }

    /**
     * 주위에 존재하는 CubeEntity 반환.
     * @param name
     * @return
     */
    public Set<CubeEntity> getMovableArea(String name){
        
        CubeEntity cube = findByName(name);
        Set<CubeEntity> areas = new HashSet<>();

        areas.add(findByPosition(cube.posX,cube.posY-1)); // UP
        areas.add(findByPosition(cube.posX,cube.posY+1)); // DOWN
        areas.add(findByPosition(cube.posX-1,cube.posY)); // LEFT
        areas.add(findByPosition(cube.posX+1,cube.posY)); // RIGHT

        areas.remove(null); // null이 들어가있다면 제거.

        return areas;
    }

    /**
     * 출발지와 목적지를 비교하여 방향 알아내기
     * @param origin
     * @param dest
     */
    public String convertToDirection(CubeEntity origin, CubeEntity dest){

        int x = origin.posX - dest.posX;
        int y = origin.posY - dest.posY;

        if(x == 1) return "left";
        if(x == -1) return "right";
        if(y == 1) return "up";
        if(y == -1) return "down";

        return "down";
    }

    /**
     * 
     * @param curCubeId
     * @param direction
     * @return 매개변수로 받은 cubeId의 direction에 해당하는 곳에 위치한 큐브 엔티티 리턴.
     *         존재하지 않는다면 유저가 현재 위치한 기존 큐브 리턴.
     * @throws NoSuchElementException curCubeId에 해당하는 큐브가 존재하지 않을 때.
     * @throws NullPointerException   curCubeId가 null값으로 들어왔을 때.
     */
    @Cacheable(value = "cubeCache")
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
                .orElse(cubeRepo.findByPosXAndPosY(cube.posX, cube.posY).get());
    }
}
