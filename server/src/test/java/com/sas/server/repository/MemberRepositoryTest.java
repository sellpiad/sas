package com.sas.server.repository;

import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.sas.server.entity.MemberEntity;
import com.sas.server.repository.MemberRepository;

@SpringBootTest
public class MemberRepositoryTest {

    @Autowired
    private MemberRepository memberRepo;

    @BeforeEach
    public void cleanup() {
        memberRepo.deleteAll();
    }

    @Test
    @DisplayName("회원 저장 기능 확인")
    public void save() {

        // given

        String id = "test";
        String password = "djfkdjk";

        memberRepo.save(MemberEntity.builder()
                .id("test")
                .password("djfkdjk")
                .build());

        // when
        List<MemberEntity> memberList = memberRepo.findAll();

        // then
        MemberEntity member = memberList.get(0);
        
        Assertions.assertEquals(id, member.id);
        Assertions.assertEquals(password, member.password);

    }
}
