package com.sas.server.service.Ranker;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sas.server.dto.Game.RankerDTO;
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
                .life(user.life)
                .conqueredTime(user.conqueredTime)
                .build();

        rankerRepo.save(ranker);
    }

    public List<RankerDTO> findAll() {

        Iterator<RankerEntity> list = rankerRepo.findAll().iterator();

        List<RankerDTO> rankerDTOList = new ArrayList<>();

        while (list.hasNext()) {

            RankerEntity ranker = list.next();

            rankerDTOList.add(RankerDTO.builder()
                    .nickname(ranker.nickname)
                    .life(ranker.life)
                    .conqueredTime(ranker.conqueredTime)
                    .build());
        }

        return rankerDTOList;

    }
}
