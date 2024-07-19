package com.sas.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sas.server.entity.PostEntity;

public interface BoardRepository extends JpaRepository<PostEntity,Long> {
    
}
