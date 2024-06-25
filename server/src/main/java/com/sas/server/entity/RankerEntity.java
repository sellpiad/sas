package com.sas.server.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import jakarta.annotation.Nonnull;
import lombok.Builder;

@RedisHash("ranker")
@Builder
public class RankerEntity {

    @Id
    @Nonnull
    String sessiondId;

    @Nonnull
    public String nickname;

    @Nonnull
    public int life;

    @Nonnull
    public LocalDateTime conqueredTime;

}
