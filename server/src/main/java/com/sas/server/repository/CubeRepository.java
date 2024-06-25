package com.sas.server.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.sas.server.entity.CubeEntity;

public interface CubeRepository extends CrudRepository<CubeEntity,String> {

        Optional<CubeEntity> findByPosXAndPosY(int posX, int posY);
}
