package com.sas.server.service.player.pattern;

public interface TimeBombPub {
    
    void registerSub(TimeBombSub subscriber);

    void notifyBomb(String username);
}
