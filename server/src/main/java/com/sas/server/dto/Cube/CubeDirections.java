package com.sas.server.dto.Cube;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CubeDirections {
 
    String north, south, east, west, central;
}
