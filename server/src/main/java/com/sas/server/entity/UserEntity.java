package com.sas.server.entity;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;
import org.springframework.format.annotation.DateTimeFormat;

import lombok.Builder;

@RedisHash(value = "user")
@Builder(toBuilder = true)
public class UserEntity {

    @Id
    public String sessionId; // 서버용 아이디
    @CreatedDate
    public LocalDateTime createdTime;

    @Indexed
    public String state;

    @Indexed
    public String nickname;
    @Indexed
    public UUID playerId; // 클라이언트용 아이디
    @Indexed
    public boolean ai;

    public int life;
    public String attr;
    public Set<String> conqueredCubes;
    public String direction;
    public LocalDateTime conqueredTime;

}
