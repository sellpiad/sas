package com.sas.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.sas.server.entity.PlayerEntity;

public interface PlayerRepository extends CrudRepository<PlayerEntity,String>{
    
    public List<PlayerEntity> findAllByAi(boolean ai);
    public List<PlayerEntity> findAllByInQueue(boolean inQueue);
    public Optional<PlayerEntity> findByPosition(String position);
}
