package com.sas.server.service.player.pattern;

import com.sas.server.controller.dto.cube.CubeData;

public interface CubePub {
    void registerSub(CubeSub subscriber);

    void unregisterSub(CubeSub subscriber);

    void notifyUpdate(CubeData cube);
}
