package com.sas.server.service.queue;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sas.server.entity.UserEntity;
import com.sas.server.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueueService {

    private final UserRepository userRepo;

    public void registerInQueue(String sessionId, String nickName, String attr) {

        UserEntity user = userRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Guest doesn't exist."));

        userRepo.save(user.toBuilder()
                .nickname(nickName)
                .createdTime(LocalDateTime.now())
                .attr(attr)
                .state("INQUEUE")
                .build());

    }

    public List<UserEntity> findAll() {

        return userRepo.findAllByState("INQUEUE");

    }
}
