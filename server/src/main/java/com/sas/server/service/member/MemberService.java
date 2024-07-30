package com.sas.server.service.member;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.esotericsoftware.minlog.Log;
import com.sas.server.dao.CustomUserDetails;
import com.sas.server.entity.MemberEntity;
import com.sas.server.exception.UserAlreadyExistsException;
import com.sas.server.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepo;
    private final PasswordEncoder passwordEncoder;

    public void save(String id, String password) {

        if(memberRepo.findById(id).isPresent())
            throw new UserAlreadyExistsException("이미 사용 중인 아이디입니다.");

        memberRepo.save(MemberEntity.builder()
                .id(id)
                .password(passwordEncoder.encode(password))
                .build());

    }

    public MemberEntity findById(String id) {
        return memberRepo.findById(id).orElse(null);
    }

    public void deleteById(String id) {
        memberRepo.deleteById(id);
    }



}
