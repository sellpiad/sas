package com.sas.server.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sas.server.entity.MemberEntity;

public interface MemberRepository extends JpaRepository<MemberEntity,Long> {
    Optional<MemberEntity> findById(String id);
    void deleteById(String id);
}
