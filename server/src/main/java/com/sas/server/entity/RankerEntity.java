package com.sas.server.entity;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import jakarta.annotation.Nonnull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@RedisHash("ranker")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankerEntity implements Serializable {

    @Id
    @Nonnull
    public String username;

    @Nonnull
    public String nickname;

    public int kill;    
    public String attr;

}
