package com.sas.server.repository;

import org.springframework.data.repository.CrudRepository;

import com.sas.server.entity.RankerEntity;

public interface RankerRepository extends CrudRepository<RankerEntity,String> {
    
}
