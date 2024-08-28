package com.sas.server.repository;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.sas.server.entity.PlayerEntity;

@SpringBootTest
public class PlayerRepositoryTest {

    @Autowired
    private PlayerRepository playerRepository;

    @Test
    public void testFindByUsernameAndInQueue() {
        String username = "testUser";
        boolean inQueue = false;

        playerRepository.save(PlayerEntity.builder()
                .inQueue(inQueue)
                .username(username)
                .build());

        Optional<PlayerEntity> player = playerRepository.findByUsernameAndInQueue(username, false);
        assertTrue(player.isPresent(), "Player should be present");
    }
}
