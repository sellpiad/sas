package com.sas.server.entity;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import lombok.Builder;

@RedisHash(value = "game")
@Builder(toBuilder = true)
public class GameEntity implements Serializable {

    @Id public UUID id;

    public String title;
    public int life;
    public int size;
    public int voteTime;

    public List<String> log;

    /** 빠른 유저 엑세스를 위한 맵 테이블.
     * {@code Key} = Session ID {@code Value} = Cube ID
     */
    public Map<String, String> userTable;

    /** 빠른 큐브 엑세스를 위한 맵 테이블.
     * {@code Key} = Cube ID {@code Value} = Session ID
     */
    public Map<String, String> cubeTable;
}
