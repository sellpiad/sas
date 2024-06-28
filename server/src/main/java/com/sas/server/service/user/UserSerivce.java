package com.sas.server.service.user;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sas.server.dto.Game.RankerDTO;
import com.sas.server.entity.UserEntity;
import com.sas.server.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSerivce {

    private final UserRepository userRepo;

    public void createUser(String sessionId) {
        UserEntity user = UserEntity.builder()
                .sessionId(sessionId)
                .state("USER")
                .build();

        userRepo.save(user);
    }

    public void save(UserEntity user) {
        userRepo.save(user);
    }

    @Transactional
    public void deleteById(String sessionId) {

        UserEntity user = findBySessionId(sessionId);

        try {
            if (user.ai == true) {
                userRepo.deleteById(sessionId);
            } else {
                user.state = "GUEST";
                userRepo.save(user);
            }
        } catch (Exception e) {
            log.error("{}", e.getMessage());
        }

    }

    /**
     * sessionID로 유저 조회.
     * 
     * @param sessionId 유저의 세션 아이디.
     * @return UserEntity를 반환한다. 없다면 null을 반환.
     * 
     */
    public UserEntity findBySessionId(String sessionId) {

        return userRepo.findById(sessionId)
                .orElse(null);

    }

    public List<UserEntity> findAllByState(String state) {
        return userRepo.findAllByState(state);
    }

    public List<RankerDTO> findAllConqueror() {

        List<UserEntity> conquerorList = userRepo.findAllByState("CONQUEROR");
        List<RankerDTO> dataList = new ArrayList<>();

        for (UserEntity conqueror : conquerorList) {
            dataList.add(RankerDTO.builder()
                    .nickname(conqueror.nickname)
                    .life(conqueror.life)
                    .conqueredTime(conqueror.conqueredTime)
                    .build());
        }

        return dataList;
    }

}
