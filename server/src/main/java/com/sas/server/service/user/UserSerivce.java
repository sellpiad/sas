package com.sas.server.service.user;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sas.server.dto.game.RankerDTO;
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
     * @param sessionId 
     * @return UserEntity 
     * @throws NullPointerException
     */
    public UserEntity findBySessionId(String sessionId) {

        Objects.requireNonNull(sessionId,"[findBySessiondID] sessionId is null.");

        return userRepo.findById(sessionId)
                .orElseThrow(() -> new NullPointerException(
                        "[findBySessionId] UserEntity not found with sessionId " + sessionId));

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
                    .build());
        }

        return dataList;
    }

}
