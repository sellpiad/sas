package com.sas.server.repository.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import com.sas.server.custom.dataType.AttributeType;

import lombok.Builder;

@RedisHash(value = "cube")
@Builder(toBuilder = true)
public class CubeEntity {

     @Id
     public String id; // 큐브 고유 아이디

     public int order; // 큐브 순서

     @Indexed
     public int posX;
     @Indexed
     public int posY;
     @Indexed
     public String name;
     @Indexed
     public AttributeType attr;
     @Indexed
     public String playerId;

     public String founder;
     public String cornerstone;
     public LocalDateTime createdTime;

     public boolean up;
     public boolean down;
     public boolean right;
     public boolean left;

}
