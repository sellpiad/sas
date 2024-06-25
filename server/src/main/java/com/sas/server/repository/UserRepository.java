package com.sas.server.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.sas.server.entity.UserEntity;


public interface UserRepository extends CrudRepository<UserEntity,String>{
    
    public List<UserEntity> findAllByState(String state);
    public List<UserEntity> findAllByAi(boolean ai);
}
