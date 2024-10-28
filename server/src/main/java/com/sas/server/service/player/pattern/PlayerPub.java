package com.sas.server.service.player.pattern;

import com.sas.server.repository.entity.PlayerEntity;

public interface PlayerPub {
    
    void registerSub(PlayerSub subscriber);
    void unregisterSub(PlayerSub subscriber);

    void notifyUpdate(PlayerEntity player);
    void notifyDelete(PlayerEntity player);
    void notifyPostpone(PlayerEntity player);
    void notifyMove(PlayerEntity player);
    void notifyInGame(PlayerEntity player, int totalQueue);
}
