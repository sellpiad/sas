package com.sas.server.util;

import java.util.Date;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;


@Component
public class JwtUtil {

    private final SecretKey key;

    // 키 설정
    public JwtUtil(@Value("${jwt.secret}") String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // JWT Token 발행
    public JwtToken generateToken(String nickname) {
  
        long now = new Date().getTime();

        // Access Token
        Date accessTokenExpire = new Date(now + 1000 * 1);
        String accessToken = Jwts.builder()
                .subject(nickname)
                .expiration(accessTokenExpire)
                .signWith(key)
                .compact();

        return JwtToken.builder()
                .grantType("Bearer")
                .accessToken(accessToken)
                .build();
    }

}
