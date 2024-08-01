package com.sas.server.entity;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@RedisHash(value = "player")
public class PlayerEntity {

    @Id
    @Indexed
    public String username;

    @Indexed
    public String nickname;

    @Indexed
    public String position;

    @Indexed
    @Builder.Default
    public boolean ai = false;

    @Indexed
    @Builder.Default
    public boolean inQueue = true;

    @CreationTimestamp
    public Date createdTime;

    /*
     * 게임 관련 불변 속성들
     */

    public String attr;

    /*
     * 게임 관련 가변 속성들
     */

    public int totalKill;
    public int totalConquer;

    /**
     * 턴을 수행하기 위해 소모되는 포인트. 기본 100.
     */
    @Builder.Default
    public int actionPoint = 100;
    /**
     * 1포인트가 충전되는 속도. ms단위. 기본 20ms.
     */
    @Builder.Default
    public int rechargingSpeed = 20;

}
