package com.sas.server.dto.Cube;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CubeDAO {

    public String name;

    public int posX;
    public int posY;

    public String founder;
    public String cornerstone;
    public LocalDateTime createdTime;

    public String attr;

}
