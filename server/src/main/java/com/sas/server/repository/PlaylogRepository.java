package com.sas.server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sas.server.entity.PlaylogEntity;

public interface PlaylogRepository extends JpaRepository<PlaylogEntity, Long> {
    List<PlaylogEntity> findAllByUsername(String username);
}
