package com.sas.server.service.player.pattern;

import com.sas.server.controller.dto.cube.CubeData;

public interface CubeSub {
    default void update(CubeData cube){};
}
