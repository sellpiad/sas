package com.sas.server.repository.redis;

import java.util.List;
import java.util.Set;

import org.springframework.data.repository.CrudRepository;

import com.sas.server.repository.entity.RankerEntity;

public interface RankerRepository extends CrudRepository<RankerEntity, String> {

    List<RankerEntity> findAllByUsername(Set<String> usernames);

}
