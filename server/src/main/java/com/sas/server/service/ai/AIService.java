package com.sas.server.service.ai;

import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.sas.server.controller.dto.admin.DeployAIState;
import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.custom.annotation.LogAction;
import com.sas.server.custom.dataType.ActivityType;
import com.sas.server.custom.dataType.AttributeType;
import com.sas.server.custom.dataType.MessageType;
import com.sas.server.logic.AISlime;
import com.sas.server.logic.MessagePublisher;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.player.pattern.PlayerSub;

import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Component
@Slf4j
public class AIService implements PlayerSub {

    private final CubeService cubeService;
    private final PlayerService playerService;
    private final MessagePublisher messagePublisher;

    private final ScheduledExecutorService scheduler;
    private ScheduledFuture<?> scheduledPlaceRandomAI;

    private Map<String, Future> actionTasks = new ConcurrentHashMap<>();

    private final AISlime aiSlime;

    /**
     * 현재 플레이어 숫자가 전체 큐브 수의 playerPercentage 보다 작다면 AI 투입.
     * 
     * @param playerPercentage
     * @throws IllegalArgumentException
     */
    public GameTotalStat placeRandomAI(double playerPercentage) {

        int totalPlayer = playerService.findAllByInGame().size() + playerService.findAllByInQueue().size();
        int totalCube = cubeService.findAll().size();
        boolean isProcessing = false;

        double fraction = ((double) totalPlayer / (double) totalCube) * 100;

        if (fraction < playerPercentage) {

            PlayerEntity ai = createAI();

            playerService.save(ai);

            isProcessing = true;
        }

        return GameTotalStat.builder()
                .isProcessing(isProcessing)
                .totalCube(totalCube)
                .totalPlayer(totalPlayer)
                .build();

    }

    public void addAI() {
        PlayerEntity ai = createAI();
        playerService.save(ai);
    }

    public void action(String sessionId) {

        int delay = (int) (Math.random() * 500) + 500; // 500ms~1000ms 사이의 반응속도

        ActionData action = aiSlime.requestAction(sessionId);

        if (action != null) {
            messagePublisher.topicPublish(MessageType.TOPIC_ACTION, action);
            Future future = scheduler.schedule(() -> action(sessionId), action.getLocktime() + delay,
                    TimeUnit.MILLISECONDS);
            actionTasks.put(sessionId, future);
        }

    }

    public void stop(String sessionId) {
        Future future = actionTasks.remove(sessionId);

        if (future != null && !future.isCancelled()) {
            future.cancel(true);
        }
    }

    private PlayerEntity createAI() {

        PlayerEntity ai = PlayerEntity.builder()
                .id(UUID.randomUUID().toString())
                .nickname(randNickname())
                .attr(getRandAttr())
                .ai(true)
                .build();

        return ai;

    }

    private String randNickname() {

        Random random = new Random();

        random.setSeed(System.currentTimeMillis());

        return "Guest" + random.nextInt(100);

    }

    private AttributeType getRandAttr() {

        Random random = new Random();

        random.setSeed(System.currentTimeMillis());

        int attr = random.nextInt(3);

        if (attr == 0)
            return AttributeType.GRASS;
        else if (attr == 1)
            return AttributeType.WATER;
        else if (attr == 2)
            return AttributeType.FIRE;

        return null;
    }

    @LogAction(username = "admin", ActivityType = ActivityType.DEPLOY_AI_RUN, isAdmin = true)
    public void deploymentRun(long initialDelay, long period, TimeUnit unit, double percentage) {
        scheduledPlaceRandomAI = scheduler.scheduleAtFixedRate(() -> {

            GameTotalStat totalStat = placeRandomAI(percentage);
            DeployAIState stat = DeployAIState.builder().period(period)
                    .isProcessing(totalStat.isProcessing)
                    .totalPlayer(totalStat.totalPlayer)
                    .totalCube(totalStat.totalCube)
                    .goal(percentage)
                    .build();

            messagePublisher.queuePublish("admin", MessageType.QUEUE_DEPLOYMENT_AI_STATE, stat);

        }, initialDelay, period, unit);
    }

    @LogAction(username = "admin", ActivityType = ActivityType.DEPLOY_AI_STOP, isAdmin = true)
    public void deploymentStop() {
        if (scheduledPlaceRandomAI != null && !scheduledPlaceRandomAI.isCancelled()) {
            scheduledPlaceRandomAI.cancel(true);
        }
    }

    public boolean deploymentState() {

        if (scheduledPlaceRandomAI == null || scheduledPlaceRandomAI.isCancelled())
            return false;
        else
            return true;
    }

    /**
     * PlayerSerivce에서 Player가 게임에 참가했다는 알림을 보냈을 때, ai인지 확인하고 동작시키는 함수.
     * 
     * @param player
     */
    @Override
    public void inGame(PlayerEntity player, int totalQueue) {
        if (player.ai) {
            action(player.id);
        }
    }

}

@Builder
class GameTotalStat {
    int totalPlayer;
    int totalCube;
    boolean isProcessing;
}
