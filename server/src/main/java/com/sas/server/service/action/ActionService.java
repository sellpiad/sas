package com.sas.server.service.action;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sas.server.annotation.DistributedLock;
import com.sas.server.dto.game.ActionData;
import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.PlayerEntity;
import com.sas.server.exception.LockAcquisitionException;
import com.sas.server.game.message.MessagePublisher;
import com.sas.server.game.rule.BattleSystem;
import com.sas.server.game.rule.ConquerSystem;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.player.PlaylogService;
import com.sas.server.service.ranker.RankerService;
import com.sas.server.util.ActionType;
import com.sas.server.util.ActivityType;
import com.sas.server.util.MessageType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ActionService.
 * 유저가 요청한 액션 처리 비즈니스 로직.
 * 
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class ActionService {

    private final PlayerService playerService;
    private final CubeService cubeService;
    private final RankerService rankerService;
    private final PlaylogService playlogService;
    private final LogService logService;

    private final ConquerSystem conquerSystem;
    private final BattleSystem battleSystem;

    private final MessagePublisher publisher;

    private final StringRedisTemplate redisTemplate;

    @DistributedLock(key = "'lock:lockon:' + #username", watingTime = 980, timeUnit = TimeUnit.MILLISECONDS)
    @Retryable(value = { LockAcquisitionException.class, Exception.class }, maxAttempts = 1)
    public ActionData requestAction(ActionType actionType, String username, String direction) {

        // 결과 도출에 필요한 정보들 가져오기
        PlayerEntity player = playerService.findById(username);
        CubeEntity target = cubeService.getNextCube(player.position, direction);
        PlayerEntity enemy = searchEnemy(target.name);

        // 막다른 곳이라면 그대로 리턴.
        if(player.position.equals(target.name)){
            return ActionData.builder()
                    .actionType(ActionType.STUCK)
                    .username(username)
                    .direction(direction)
                    .target(player.position)
                    .build();
        }

        // 액션 분류
        if (actionType.equals(ActionType.NOTCLASSIFIED)) {
            actionType = classifyAction(player, enemy);
        }

        // 움직일 필요가 없는 액션이라면 위치 변경 없이 리턴
        if (actionType.equals(ActionType.DRAW) || actionType.equals(ActionType.FEARED)) {
            return ActionData.builder()
                    .actionType(actionType)
                    .username(username)
                    .direction(direction)
                    .target(player.position)
                    .build();
        }

        
        doAction(actionType, player, target, enemy);
        publishMessage(actionType, direction, player, enemy, target);

  
        return ActionData.builder()
                .actionType(actionType)
                .username(username)
                .direction(direction)
                .target(target.name)
                .build();
    }

    @Recover
    public ActionData recoverAction(LockAcquisitionException e, ActionType actionType, String username,
            String direction) {

        return ActionData.builder()
                .actionType(ActionType.LOCKED)
                .username(username)
                .build();
    }

    @Recover
    public ActionData recoverAction(Exception e, ActionType actionType, String username, String direction) {

        log.error("{}", e.getMessage());

        return ActionData.builder()
                .actionType(ActionType.LOCKED)
                .direction(direction)
                .username(username)
                .build();
    }

    private ActionType classifyAction(PlayerEntity player, PlayerEntity enemy) {

        return battleSystem.attrJudgment(player, enemy);
    }

    private void doAction(ActionType actionType, PlayerEntity player, CubeEntity target, PlayerEntity enemy) {

        redisTemplate.delete("lock:cube:" + player.position);

        switch (actionType) {
            case ActionType.ATTACK:
                doAttack(player, enemy, target);
                doMove(player, target);
                break;
            case ActionType.MOVE:
                doMove(player, target);
                break;
            case ActionType.DRAW:
                doDraw(player);
                break;
            case ActionType.FEARED:
                doDraw(player);
                break;
            case ActionType.CONQUER_START:
                doConquer(player, target);
                break;
            case ActionType.CONQUER_CANCEL:
                cancelConquer(player);
                break;
            default:
                break;
        }
    }

    private void doAttack(PlayerEntity player, PlayerEntity enemy, CubeEntity target) {

        // 상대를 락온
        boolean isLockon = redisTemplate.opsForValue().setIfAbsent("lock:lockon:" + enemy.username, "LOCKED", 500,
                TimeUnit.MILLISECONDS);

        if (!isLockon) {
            throw new LockAcquisitionException("Try again");
        }

        // 패배자 삭제 및 리얼타임 랭크에서 삭제, 그 후 올타임 랭크에 기록
        redisTemplate.delete("lock:cube:" + enemy.position);
        playerService.deleteById(enemy.username);
        rankerService.removeRealtimeRank(enemy.username);
        rankerService.updateAlltimeRank(enemy);

        // ai가 아닐때만 플레이 로그 저장
        if (!enemy.ai) {
            playlogService.save(enemy);
            logService.save(enemy.username, ActivityType.STOP);
        }

        player = playerService.incKill(player);

        rankerService.updateRealtimeRank(player);
    }

    private void doMove(PlayerEntity player, CubeEntity target) {
        playerService.updatePlayer(player.toBuilder().position(target.name).build());
        redisTemplate.opsForSet().add("lock:cube:" + target.name, "");
    }

    private void doDraw(PlayerEntity player) {
        redisTemplate.opsForSet().add("lock:cube:" + player.position, "");
    }

    private String doConquer(PlayerEntity player, CubeEntity target) {

        conquerSystem.notifyConquest(player, target, 3000, null);

        return target.name;
    }

    private boolean cancelConquer(PlayerEntity player) {
        return conquerSystem.cancelConquer(player);
    }

    private PlayerEntity searchEnemy(String position) {

        if (redisTemplate.opsForSet().size("lock:cube:" + position) == 0) {
            return null;
        } else {
            return playerService.findByPosition(position);
        }
    }

    private void publishMessage(ActionType actionType, String direction, PlayerEntity player, PlayerEntity enemy,
            CubeEntity target) {

        switch (actionType) {
            case ActionType.ATTACK:
                publisher.topicPublish(MessageType.TOPIC_LOCKON, enemy.username);
                publisher.topicPublish(MessageType.TOPIC_DELETE, enemy.username);
                publisher.topicPublish(MessageType.TOPIC_RANKER_ALLTIME, rankerService.getAlltimeRank());
                publisher.topicPublish(MessageType.TOPIC_RANKER_REALTIME, rankerService.getRealtimeRank());
                publisher.queuePublish(player.username, MessageType.QUEUE_INCKILL, player.totalKill);
                break;
            case ActionType.MOVE:

                break;
            case ActionType.DRAW:

                break;
            case ActionType.FEARED:

                break;
            case ActionType.CONQUER_START:
                publisher.topicPublish(MessageType.TOPIC_CONQUER_START, target.name);
                break;
            case ActionType.CONQUER_CANCEL:
                publisher.topicPublish(MessageType.TOPIC_CONQUER_CANCEL, target.name);
                break;
            default:
                break;
        }

        // AI라면 별도로 메시지 전송.
        if (player.ai) {
            publisher.topicPublish(MessageType.TOPIC_ACTION, ActionData.builder()
                    .actionType(actionType)
                    .direction(direction)
                    .username(player.username)
                    .target(target.name)
                    .build());
        }
    }

}
