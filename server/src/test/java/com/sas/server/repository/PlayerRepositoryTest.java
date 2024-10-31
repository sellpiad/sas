package com.sas.server.repository;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.repository.redis.PlayerRepository;

@SpringBootTest
public class PlayerRepositoryTest {

    @Autowired
    private PlayerRepository playerRepository;

}
