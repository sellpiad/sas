package com.sas.server.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import lombok.Builder;


@RedisHash(value="cube")
@Builder(toBuilder = true)
public class CubeEntity {
    
     @Id public String id;
     
     public int order;
     @Indexed public int posX;
     @Indexed public int posY;
     @Indexed public String name;
     
     public String nickname;
     public String founder;
     public String cornerstone;
     public LocalDateTime createdTime;

     public boolean up;
     public boolean down;
     public boolean right;
     public boolean left;

     public String attr;

}
