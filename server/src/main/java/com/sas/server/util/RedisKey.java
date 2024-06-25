package com.sas.server.util;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.KeyScanOptions;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Component
@Slf4j
public class RedisKey {

    private final RedisTemplate<String, String> redisTemplate;

    public Set<String> getKeys(String pattern) {

        Set<String> keys = new HashSet<>();

        ScanOptions scanOptions = KeyScanOptions.scanOptions()
                .match(pattern)
                .count(10)
                .build();


        Cursor<byte[]> cursor = redisTemplate.executeWithStickyConnection(
            conn -> conn.commands().scan(scanOptions));
        
        while(cursor.hasNext()){
            keys.add(new String(cursor.next()));
        }

        return keys;
    }

}
