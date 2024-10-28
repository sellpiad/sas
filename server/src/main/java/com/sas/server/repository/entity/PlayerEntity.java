package com.sas.server.repository.entity;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sas.server.custom.dataType.AttributeType;
import com.sas.server.service.action.strategy.ActionStrategy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@RedisHash(value = "player")
public class PlayerEntity {

    @Id
    public String id;

    @Indexed
    public String nickname;

    @Indexed
    public String position;

    @Indexed
    @Builder.Default
    public boolean inQueue = true;

    @CreationTimestamp
    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern="yyyy-MM-dd HH:mm", timezone="Asia/Seoul")
    public Date createdTime;

    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern="yyyy-MM-dd HH:mm", timezone="Asia/Seoul")
    public Date removedTime;

     /*
     * AI 관련 flags
     */
    @Indexed
    @Builder.Default
    public boolean ai = false;
    public boolean isDumb;  // 벽 감지 유무
    public boolean isDefensive; // 적 감지 유무
    public boolean isAggressive; // 먹이 감지 유무
    public boolean isFriendly; // 동족 감지 유무
    public int scanableRange; // 주위 영역 스캔 가능 범위.

    /*
     * 게임 관련 불변 속성들
     */

    public AttributeType attr;

    /*
     * 게임 관련 가변 속성들
     */

    public int totalKill;
    public int totalConquer;
    public String direction;
    public int buffCount;
    public int nuffCount;

    /*
     * 액션 전략
     */
    
     public ActionStrategy strategy;
}
