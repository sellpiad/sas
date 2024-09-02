package com.sas.server.service.action;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import com.sas.server.dto.game.ActionData;
import com.sas.server.dto.game.CubeAttrData;
import com.sas.server.entity.CubeEntity;
import com.sas.server.entity.PlayerEntity;
import com.sas.server.exception.LockAcquisitionException;
import com.sas.server.game.message.MessagePublisher;
import com.sas.server.service.admin.LogService;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;
import com.sas.server.service.player.PlaylogService;
import com.sas.server.service.ranker.RankerService;
import com.sas.server.util.ActionType;
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

    private final ActionSystem actionSystem;
    private final ConquerSystem conquerSystem;
    private final BattleSystem battleSystem;

    private final MessagePublisher publisher;

    private final StringRedisTemplate redisTemplate;

    @Retryable(value = { LockAcquisitionException.class, Exception.class }, maxAttempts = 1)
    public ActionData requestAction(ActionType actionType, String username, String direction) {

        // 결과 도출에 필요한 정보들 가져오기
        PlayerEntity player = playerService.findById(username);
        CubeEntity target = cubeService.getNextCube(player.position, direction);
        PlayerEntity enemy = searchEnemy(target.name);

        // 막다른 곳이라면 그대로 리턴.
        if (player.position.equals(target.name)) {
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

        boolean actionComplete = doAction(actionType, player, target, enemy);

        if (actionComplete) {
            publishMessage(actionType, direction, player, enemy, target);
        }

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
                .direction(direction)
                .build();
    }

    @Recover
    public ActionData recoverAction(Exception e, ActionType actionType, String username,
            String direction) {

        log.error("{}", e.getMessage());

        return ActionData.builder()
                .actionType(ActionType.LOCKED)
                .username(username)
                .direction(direction)
                .build();
    }

    private ActionType classifyAction(PlayerEntity player, PlayerEntity enemy) {

        return battleSystem.attrJudgment(player, enemy);
    }

    private boolean doAction(ActionType actionType, PlayerEntity player, CubeEntity target, PlayerEntity enemy) {

        switch (actionType) {
            case ActionType.ATTACK:
                return actionSystem.doAttack(player, enemy, target);
            case ActionType.MOVE:
                return actionSystem.doMove(player, target);
            case ActionType.CONQUER_START:
                return actionSystem.doConquer(player, target);
            case ActionType.CONQUER_CANCEL:
                return actionSystem.cancelConquer(player);
            default:
                return false;
        }

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
                publisher.topicPublish(MessageType.TOPIC_CONQUER_START,
                        CubeAttrData.builder()
                                .name(target.name)
                                .attr(player.attr)
                                .build());
                break;
            case ActionType.CONQUER_CANCEL:
                publisher.topicPublish(MessageType.TOPIC_CONQUER_CANCEL, CubeAttrData.builder()
                        .name(target.name)
                        .attr(player.attr)
                        .build());
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
