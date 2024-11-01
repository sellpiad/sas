package com.sas.server.repository.redis;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import com.sas.server.repository.entity.GameEntity;

public interface GameRepository extends CrudRepository<GameEntity, UUID> {

    Iterable<GameEntity> findAll();
    Optional<GameEntity> findById();
}
