package com.sas.server.service.player.pattern;

import com.sas.server.repository.entity.PlayerEntity;

public interface PlayerSub {
    default void delete(PlayerEntity player) {};
    default void update(PlayerEntity player) {};
    default void postpone(PlayerEntity player) {};
    default void move(PlayerEntity player) {};
    default void inGame(PlayerEntity player,int totalQueue) {};
}
