package com.sas.server.service.member;

import org.springframework.stereotype.Service;

import com.sas.server.entity.MemberEntity;
import com.sas.server.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepo;

    public void save(String id, String password) {

        memberRepo.save(MemberEntity.builder()
                .id(id)
                .password(password)
                .build());

    }

    public MemberEntity findById(String id){
        return memberRepo.findById(id).orElseGet(null);
    }

    public void deleteById(String id) {
        memberRepo.deleteById(id);
    }

}
