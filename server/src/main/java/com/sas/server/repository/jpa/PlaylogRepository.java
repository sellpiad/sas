package com.sas.server.repository.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sas.server.repository.entity.PlaylogEntity;

public interface PlaylogRepository extends JpaRepository<PlaylogEntity, Long> {
    
    @Query("SELECT p FROM PlaylogEntity p WHERE p.username = :username ORDER BY p.playTime DESC")
    List<PlaylogEntity> findAllByUsername(@Param("username") String username);

    @Query("SELECT p FROM PlaylogEntity p WHERE p.username = :username ORDER BY p.totalKill DESC LIMIT 1")
    Optional<PlaylogEntity> findTopByUsernameOrderByTotalKillDesc(@Param("username") String username);

    @Query("SELECT p.attr FROM PlaylogEntity p WHERE p.username = :username GROUP BY p.attr ORDER BY COUNT(p.attr) DESC LIMIT 1")
    Optional<String> findMostFrequentAttrByUsername(@Param("username") String username);
}
