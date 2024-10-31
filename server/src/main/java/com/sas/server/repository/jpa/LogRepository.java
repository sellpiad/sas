package com.sas.server.repository.jpa;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import com.sas.server.repository.entity.LogEntity;

public interface LogRepository extends JpaRepository<LogEntity, Long> {

    default List<LogEntity> findAllSortedByTimeDesc() {
        return findAll(Sort.by(Sort.Order.desc("time")));
    }

    List<LogEntity> findByUsernameContaining(String username);
}
