package com.sas.server.repository.entity;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import com.sas.server.custom.dataType.AttributeType;

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

    public long lifeTime;   
    public AttributeType attr;
    

}
