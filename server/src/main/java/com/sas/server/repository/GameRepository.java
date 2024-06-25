package com.sas.server.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.CrudRepository;

import com.sas.server.entity.GameEntity;

import jakarta.persistence.LockModeType;

public interface GameRepository extends CrudRepository<GameEntity, UUID> {

    @SuppressWarnings("null")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Iterable<GameEntity> findAll();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<GameEntity> findById();
}
