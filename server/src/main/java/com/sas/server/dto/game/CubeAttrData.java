package com.sas.server.dto.game;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CubeAttrData {
    String name;
    String attr;
}