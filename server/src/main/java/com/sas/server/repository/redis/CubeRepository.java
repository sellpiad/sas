package com.sas.server.repository.redis;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.sas.server.custom.dataType.AttributeType;
import com.sas.server.repository.entity.CubeEntity;

public interface CubeRepository extends CrudRepository<CubeEntity,String> {

        Optional<CubeEntity> findByPosXAndPosY(int posX, int posY);
        Optional<CubeEntity> findByName(String name);
        Optional<CubeEntity> findByPlayerId(String playerId);
        List<CubeEntity> findAllByAttr(AttributeType attr);

}
