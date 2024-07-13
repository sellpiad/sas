package com.sas.server.game.rule;

import java.util.Random;

import org.springframework.stereotype.Component;

import com.sas.server.entity.UserEntity;

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
     * @return 플레이어가 승리했다면 true, 공격 대상이 승리했다면 false
     * @throws IllegalArgumentException 유효한 속성값이 존재하지 않는다면
     */
    public boolean attrJudgment(UserEntity player, UserEntity enemy) {

        if (enemy == null)
            return true;

        if (player.attr.equals(enemy.attr)) {

            Random rand = new Random();
            rand.setSeed(System.currentTimeMillis());

            return rand.nextBoolean();

        }

        switch (player.attr) {
            case "WATER":
                return enemy.attr.equals("FIRE");
            case "GRASS":
                return enemy.attr.equals("WATER");
            case "FIRE":
                return enemy.attr.equals("GRASS");
            default:
                throw new IllegalArgumentException("Wrong Attribute!");
        }
    }

}
