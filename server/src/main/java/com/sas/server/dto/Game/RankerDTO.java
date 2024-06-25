package com.sas.server.dto.Game;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RankerDTO{

    public String nickname;
    public int life;
    public LocalDateTime conqueredTime;

}