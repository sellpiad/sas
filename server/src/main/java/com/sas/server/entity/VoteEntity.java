package com.sas.server.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import lombok.Builder;

@RedisHash(value="vote")
@Builder
public class VoteEntity {
    
    @Id public String id;
    @Indexed public String cubeName;
    @Indexed public String direction;

}
