package com.sas.server.service.player;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sas.server.entity.PlayerEntity;
import com.sas.server.entity.PlaylogEntity;
import com.sas.server.repository.PlaylogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlaylogService {

    private final PlaylogRepository repo;

    public PlaylogEntity save(PlayerEntity player) {

        PlaylogEntity log = PlaylogEntity.builder()
                .username(player.username)
                .attr(player.attr)
                .totalKill(player.totalKill)
                .build();

        repo.save(log);

        return log;

    }

    public List<PlaylogEntity> findAllByUsername(String username){
        return repo.findAllByUsername(username);
    }

}
