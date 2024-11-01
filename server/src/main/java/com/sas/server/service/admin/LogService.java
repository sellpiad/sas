package com.sas.server.service.admin;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.sas.server.custom.dataType.ActivityType;
import com.sas.server.repository.entity.LogEntity;
import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.repository.jpa.LogRepository;
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

    public LogEntity save(String username, ActivityType activityType, boolean isAdmin) {
        return repo.save(LogEntity.builder()
                .username(username)
                .activityType(activityType.getType())
                .isAdmin(true)
                .build());
    }

    public List<LogEntity> findAll() {
        return repo.findAll(Sort.by(Sort.Order.desc("time")));
    }

    public List<LogEntity> findAllByUsername(String username) {
        return repo.findByUsernameContaining(username);
    }

    public List<LogEntity> findAllByIsAdmin(boolean isAdmin) {
        return repo.findAllByIsAdmin(isAdmin)
                .stream()
                .sorted(Comparator.comparing(LogEntity::getTime).reversed())
                .collect(Collectors.toList());
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
