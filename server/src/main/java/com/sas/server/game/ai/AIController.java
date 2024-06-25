package com.sas.server.game.ai;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.sas.server.dto.Game.SlimeDTO;
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

    private Map<String, AISlime> slimeController = new HashMap<>();

    /**
     * 현재 플레이어 숫자가 전체 큐브 수의 playerPercentage 보다 작다면 AI 투입.
     * 
     * @param playerPercentage
     */
    @Transactional
    public void placeRandomAI(double playerPercentage) {

        log.info("Deploy Random AI!");

        GameEntity game = gameService.findGame();

        if (game == null)
            return;

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

            playerService.registerPlayer(ai, true, cubeNickname);
            gameService.addOnly(game, ai.sessionId, randCubeId);

           
            UserEntity aiPlayer = userSerivce.findBySessionId(ai.sessionId);

            SlimeDTO slime = SlimeDTO.builder()
                    .playerId(aiPlayer.playerId)
                    .attr(aiPlayer.attr)
                    .direction("down")
                    .position(cubeNickname)
                    .build();
                    
            gameService.saveGame(game);

            String msg = ai.nickname + "이 " + cubeNickname + "에서 플레이를 시작합니다.";

            messagingTemplate.convertAndSend("/topic/game/addSlime", slime);
            messagingTemplate.convertAndSend("/topic/game/chat", msg);

            try {
                slimeController.get(ai.sessionId).run(ai.sessionId, () -> {
                    slimeController.remove(ai.sessionId);
                });
            } catch (Exception e) {
                log.error(e.getMessage());
            }

        }

    }

    private UserEntity createAI() {

        UserEntity ai = UserEntity.builder()
                .sessionId(UUID.randomUUID().toString())
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
