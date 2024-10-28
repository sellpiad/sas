package com.sas.server.service.admin;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sas.server.custom.dataType.ActivityType;
import com.sas.server.repository.LogRepository;
import com.sas.server.repository.entity.LogEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.service.player.pattern.PlayerSub;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class LogService implements PlayerSub {
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

    public List<LogEntity> findAllByUsername(String username) {
        return repo.findByUsernameContaining(username);
    }

    @Override
    public void delete(PlayerEntity player) {
        if (!player.ai)
            save(player.id, ActivityType.STOP);
    }

    @Override
    public void inGame(PlayerEntity player, int totalQueue) {
        if (!player.ai)
            save(player.id, ActivityType.PLAY);
    }

}
