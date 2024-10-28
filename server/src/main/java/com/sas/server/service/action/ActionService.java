package com.sas.server.service.action;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sas.server.controller.dto.game.ActionData;
import com.sas.server.custom.dataType.ActionType;
import com.sas.server.custom.dataType.AttributeType;
import com.sas.server.custom.dataType.DurationSet;
import com.sas.server.custom.exception.LockAcquisitionException;
import com.sas.server.repository.entity.CubeEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.action.strategy.ActionContext;
import com.sas.server.service.action.strategy.ActionStrategy;
import com.sas.server.service.action.strategy.FearedStrategy;
import com.sas.server.service.action.strategy.MoveStrategy;
import com.sas.server.service.action.strategy.MoveWithAttackStrategy;
import com.sas.server.service.action.strategy.MoveWithItemStrategy;
import com.sas.server.service.action.strategy.StuckStrategy;
import com.sas.server.service.cube.CubeService;
import com.sas.server.service.player.PlayerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 
 * 유저가 요청한 액션 처리 비즈니스 로직. <br/>
 * 
 * 1. 액션 요청(requestAction) <br/>
 * 2. 액션에 필요한 정보 분류(requestAction) <br/>
 * 3. 액션 가능 여부 분류.(락 타임, 중복 요청 등) -> 각 액션 함수가 담당. <br/>
 * 4. ActionData 반환
 * 
 * @see ActionData
 * @see ActionType
 * @see DurationSet
 * 
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class ActionService {

    /*
     * 비즈니스 로직 관련
     */
    private final PlayerService playerService;
    private final CubeService cubeService;

    /*
     * DB 입출력
     */
    private final StringRedisTemplate redisTemplate;

    /**
     * 클라이언트의 요청(actiontype, username, direction)을 받아, 처리 결과({@code ActionData})를
     * 반환.
     * <br>
     * </br>
     * 액션 타입 분류, 액션 타겟 설정, 액션 duration 설정.
     * <br>
     * </br>
     * 액션 결과에 따라 반환된 lockTime만큼 락이 걸리며, 락이 걸려있을 때 요청시 LockAcquistionException 반환.
     * 
     * @return ActionData - 액션 주체 유저, 방향, 액션 타입, 타겟, duration
     * @throws LockAcquistionException 락 획득 실패시
     */

    @Retryable(value = { LockAcquisitionException.class, IllegalStateException.class,
            Exception.class }, maxAttempts = 1)
    public ActionData requestAction(ActionType reqeustActionType, String playerId, String direction) {

        // 액션 처리에 필요한 정보들 조회
        PlayerEntity player = playerService.findByUsername(playerId);
        CubeEntity target = cubeService.getNextCube(player.position, direction);
        PlayerEntity enemy = playerService.findByPosition(target == null ? "" : target.name);

        // 플레이어 방향 조절
        player = player.toBuilder().direction(direction).build();

        // 전략 설정
        ActionStrategy strategy = getStrategy(player, target, enemy);

        // 액션 컨텍스트 생성
        ActionContext action = new ActionContext(strategy, player, enemy, target, playerService, cubeService,
                redisTemplate);

         // 액션 실행 및 결과 리턴
        return action.doAction();

    }

    public ActionStrategy getStrategy(PlayerEntity player, CubeEntity target, PlayerEntity enemy) {

        // 이동할 장소가 없다면 stuck
        if (target == null)
            return new StuckStrategy();

        // 적이 있다면 공격
        if (enemy != null)
            return new MoveWithAttackStrategy();

        // 아이템이 있다면 아이템 얻기
        if (target.attr != AttributeType.NORMAL)
            return new MoveWithItemStrategy();

        // 모두 해당 되지 않는다면 이동
        return new MoveStrategy();

    }

    /**
     * Function requestAction 락 획득 실패 시
     * 
     * @param e
     * @param actionType
     * @param username
     * @param direction
     * @return ActionData
     */
    @Recover
    public ActionData recoverAction(LockAcquisitionException e, ActionType actionType, String username,
            String direction) {

        return ActionData.builder()
                .actionType(ActionType.LOCKED)
                .username(username)
                .build();
    }

    /**
     * <p>
     * 플레이어가 이미 사망했을 때 일어나는 예외.
     * </p>
     * doAction에서 일어난 transactional 롤백되었기에 임의로 플레이어만 다시 삭제.
     * 
     * @param e
     * @param actionType
     * @param username
     * @param direction
     * @return
     */

    @Recover
    public ActionData recoverAction(IllegalStateException e, ActionType actionType, String username,
            String direction) {

        playerService.deleteById(username);

        return ActionData.builder()
                .actionType(ActionType.LOCKED)
                .username(username)
                .build();
    }

    /**
     * Function requestAction 예외 발생 시.(테스트 용도)
     * 
     * @param e
     * @param actionType
     * @param username
     * @param direction
     * @return
     */
    @Recover
    public ActionData recoverAction(Exception e, ActionType actionType, String username,
            String direction) {

        log.error("{}", e.getMessage());

        return ActionData.builder()
                .actionType(ActionType.LOCKED)
                .username(username)
                .build();
    }

    /**
     * 플레이어와 공격 대상 간의 상성 관계에 따른 승패 여부 판별.
     * 
     * 적이 없을 시 MOVE
     * 
     * 승리 시 ATTACK
     * 
     * 무승부 시 DRAW
     * 
     * 공격 불가시 FEARED
     *
     * @param playerAttr 플레이어 속성
     * @param enemyAttr  적 속성
     * @return 액션타입을 반환.
     * @throws IllegalArgumentException 유효한 속성값이 존재하지 않는다면
     */
    public ActionType attrJudgment(PlayerEntity player, PlayerEntity enemy) {

        if (player.attr.equals(enemy.attr)) {
            return ActionType.DRAW;
        }

        switch (player.attr) {
            case AttributeType.WATER:
                return enemy.attr.equals(AttributeType.FIRE) ? ActionType.ATTACK : ActionType.FEARED;
            case AttributeType.GRASS:
                return enemy.attr.equals(AttributeType.WATER) ? ActionType.ATTACK : ActionType.FEARED;
            case AttributeType.FIRE:
                return enemy.attr.equals(AttributeType.GRASS) ? ActionType.ATTACK : ActionType.FEARED;
            default:
                throw new IllegalArgumentException("Wrong Attribute!");
        }
    }

}
