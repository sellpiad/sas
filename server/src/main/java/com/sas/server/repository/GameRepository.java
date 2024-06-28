package com.sas.server.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import com.sas.server.entity.GameEntity;

public interface GameRepository extends CrudRepository<GameEntity, UUID> {

    Iterable<GameEntity> findAll();
    Optional<GameEntity> findById();
}
