package com.sas.server.service.player;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sas.server.repository.entity.PlayerEntity;
import com.sas.server.repository.entity.PlaylogEntity;
import com.sas.server.repository.jpa.PlaylogRepository;
import com.sas.server.service.player.pattern.PlayerSub;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlaylogService implements PlayerSub {

    private final PlaylogRepository repo;

    public PlaylogEntity save(PlayerEntity player) {

        PlaylogEntity log = PlaylogEntity.builder()
                .username(player.id)
                .nickname(player.nickname)
                .attr(player.attr)
                .totalKill(player.totalKill)
                .build();

        repo.save(log);

        return log;

    }

    public int findKillMaxByUsername(String username) {
        PlaylogEntity log = repo.findTopByUsernameOrderByTotalKillDesc(username)
                .orElse(null);

        if (log == null)
            return 0;

        return log.getTotalKill();
    }

    public String findMostFrequentAttrByUsername(String username) {
        return repo.findMostFrequentAttrByUsername(username).orElse(new String("NOT PLAY EVER"));
    }

    public List<PlaylogEntity> findAllByUsername(String username) {

        List<PlaylogEntity> list = repo.findAllByUsername(username);



        return repo.findAllByUsername(username);
    }

    @Override
    public void delete(PlayerEntity player) {
        if(!player.ai)
            save(player);
    }


}
