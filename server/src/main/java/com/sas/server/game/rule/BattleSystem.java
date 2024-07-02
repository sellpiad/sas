package com.sas.server.game.rule;

import java.util.Random;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BattleSystem {

    /**
     * 목적지와 플레이어 아이디를 넣으면, 패배한 측의 세션 아이디 반환
     * 
     * @param playerAttr 플레이어 속성
     * @param enemyAttr  적 속성
     * @return 플레이어가 승리했다면 true, 패배했다면 false
     * @throws IllegalArgumentException 속성값이 존재하지 않는다면
     */
    public boolean attrJudgment(String playerAttr, String enemyAttr) {

        if (playerAttr.equals(enemyAttr)) {

            Random rand = new Random();
            rand.setSeed(System.currentTimeMillis());

            return rand.nextBoolean();

        }

        switch (playerAttr) {
            case "WATER":
                return enemyAttr.equals("FIRE");
            case "GRASS":
                return enemyAttr.equals("WATER");
            case "FIRE":
                return enemyAttr.equals("GRASS");
            default:
                throw new IllegalArgumentException("Wrong Attribute!");
        }
    }
}
