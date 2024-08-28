package com.sas.server.game.rule;

import java.util.Random;

import org.springframework.stereotype.Component;

import com.sas.server.entity.PlayerEntity;
import com.sas.server.util.ActionType;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BattleSystem {

    /**
     * 플레이어와 공격 대상 간의 상성 관계에 따른 승패 여부 판별.
     * 공격 대상이 존재하지 않는다면 승리로 판정.
     * 
     * @param playerAttr 플레이어 속성
     * @param enemyAttr  적 속성
     * @return 액션타입을 반환. 승리시 ATTACK, 패배시 DIED, 무승부시 DRAW, 적이 없을시 MOVE
     * @throws IllegalArgumentException 유효한 속성값이 존재하지 않는다면
     */
    public ActionType attrJudgment(PlayerEntity player, PlayerEntity enemy) {

        if (enemy == null)
            return ActionType.MOVE;

        if (player.attr.equals(enemy.attr)) {
            return ActionType.DRAW;
        }

        switch (player.attr) {
            case "WATER":
                return enemy.attr.equals("FIRE") ? ActionType.ATTACK : ActionType.FEARED;
            case "GRASS":
                return enemy.attr.equals("WATER") ? ActionType.ATTACK : ActionType.FEARED;
            case "FIRE":
                return enemy.attr.equals("GRASS") ? ActionType.ATTACK : ActionType.FEARED;
            default:
                throw new IllegalArgumentException("Wrong Attribute!");
        }
    }

}
