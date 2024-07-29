package com.sas.server.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import jakarta.annotation.Nonnull;
import lombok.Builder;

@RedisHash("ranker")
@Builder
public class RankerEntity {

    @Id
    @Nonnull
    String playerId;

    @Nonnull
    public String nickname;

    public int kill;    
    public String attr;

}
