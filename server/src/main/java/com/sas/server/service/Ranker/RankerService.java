package com.sas.server.service.ranker;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sas.server.dto.game.RankerDTO;
import com.sas.server.entity.RankerEntity;
import com.sas.server.entity.UserEntity;
import com.sas.server.repository.RankerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RankerService {

    private final RankerRepository rankerRepo;

    public void save(UserEntity user) {

        RankerEntity ranker = RankerEntity.builder()
                .sessiondId(user.sessionId)
                .nickname(user.nickname)
                .attr(user.attr)
                .kill(user.kill)
                .build();

        rankerRepo.save(ranker);
    }

    public List<RankerDTO> getRankerList() {

        Iterator<RankerEntity> rankerIter = rankerRepo.findAll().iterator();
        List<RankerDTO> rankerList = new ArrayList<>();

        while (rankerIter.hasNext()) {

            RankerEntity ranker = rankerIter.next();

            RankerDTO rankerDTO = RankerDTO.builder()
                    .attr(ranker.attr)
                    .nickname(ranker.nickname)
                    .kill(ranker.kill)
                    .build();

            rankerList.add(rankerDTO);
        }

        rankerList.sort(Comparator.comparingInt(RankerDTO::getKill).reversed());

        if(rankerList.size() > 100){
            rankerList.subList(0, 99);
        }

        return rankerList;
    }
}
