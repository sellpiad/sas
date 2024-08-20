package com.sas.server.service.admin;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sas.server.entity.LogEntity;
import com.sas.server.repository.LogRepository;
import com.sas.server.util.ActivityType;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class LogService {
    private final LogRepository repo;

    public LogEntity save(String username, ActivityType activityType) {
        return repo.save(LogEntity.builder()
                .username(username)
                .activityType(activityType.getType())
                .build());
    }

    public List<LogEntity> findAll() {
        return repo.findAllSortedByTimeDesc();
    }

    public List<LogEntity> findAllByUsername(String username){
        return repo.findByUsernameContaining(username);
    }

}
