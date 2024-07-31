package com.sas.server.dto.game;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RankerDTO{

    public String nickname;
    public int kill;
    public String attr;

}