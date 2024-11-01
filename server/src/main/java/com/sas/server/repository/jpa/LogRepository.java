package com.sas.server.repository.jpa;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sas.server.repository.entity.LogEntity;

public interface LogRepository extends JpaRepository<LogEntity, Long> {
    
    List<LogEntity> findByUsernameContaining(String username);

    List<LogEntity> findAllByIsAdmin(boolean isAdmin);
}
