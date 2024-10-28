package com.sas.server.repository.entity;

import java.io.Serializable;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import lombok.Builder;

@RedisHash(value = "game")
@Builder(toBuilder = true)
public class GameEntity implements Serializable {

    @Id public UUID id;

    public String title;
    public int size;
}
