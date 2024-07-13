package com.sas.server.game.ai;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.sas.server.Annotation.DistributedLock;
import com.sas.server.entity.GameEntity;
import com.sas.server.entity.UserEntity;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.game.GameService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.user.UserSerivce;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Component
@Slf4j
public class AIController {

    private final CubeService cubeService;

    private final PlayerService playerService;
    private final GameService gameService;
    private final UserSerivce userSerivce;

    private final SimpMessagingTemplate messagingTemplate;

    private final ObjectProvider<AISlime> aiSlimeProvider;

    private final StringRedisTemplate redisTemplate;

    private Map<String, AISlime> slimeController = new HashMap<>();

    /**
     * 현재 플레이어 숫자가 전체 큐브 수의 playerPercentage 보다 작다면 AI 투입.
     * 
     * @param playerPercentage
     * @throws IllegalArgumentException
     */
    @DistributedLock(key = "lock:game")
    public UserEntity placeRandomAI(double playerPercentage) {

        GameEntity game = gameService.findGame();

        Map<String, String> cubeTable = game.cubeTable;

        long totalNull = cubeTable.values().stream().filter(value -> value.equals("null")).count();
        int totalCube = cubeTable.size();

        double fraction = (double) totalNull / totalCube;

        if (fraction > playerPercentage) {

            UserEntity ai = createAI();

            List<String> cubekeySet = cubeTable.entrySet()
                    .stream()
                    .filter(entry -> entry.getValue().equals("null"))
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());

            if (cubekeySet.isEmpty()) {
                throw new IllegalArgumentException("There's no cube with null");
            }

            String randCubeId = cubekeySet.get(new Random().nextInt(cubekeySet.size()));

            String cubeNickname = cubeService.getCubeNickname(randCubeId);

            gameService.addOnly(game, ai.sessionId, randCubeId);
            playerService.registerPlayer(ai, true, cubeNickname);

            gameService.saveGame(game);

            CompletableFuture.runAsync(() -> {
                runAI(ai.sessionId);
            });

            return userSerivce.findBySessionId(ai.sessionId);
        }

        return null;

    }

    public void runAI(String sessionId) {

        slimeController.get(sessionId).run(sessionId, () -> {
            slimeController.remove(sessionId);
        });

    }

    private UserEntity createAI() {

        UserEntity ai = UserEntity.builder()
                .sessionId(UUID.randomUUID().toString())
                .createdTime(LocalDateTime.now())
                .ai(true)
                .nickname(randNickname())
                .attr(getRandAttr())
                .build();

        AISlime aiSlime = aiSlimeProvider.getObject();

        slimeController.put(ai.sessionId, aiSlime);

        return ai;

    }

    private String randNickname() {

        Random random = new Random();

        random.setSeed(System.currentTimeMillis());

        return "Guest" + random.nextInt(100);

    }

    private String getRandAttr() {

        Random random = new Random();

        random.setSeed(System.currentTimeMillis());

        int attr = random.nextInt(3);

        if (attr == 0)
            return "GRASS";
        else if (attr == 1)
            return "WATER";
        else if (attr == 2)
            return "FIRE";

        return null;
    }

}
