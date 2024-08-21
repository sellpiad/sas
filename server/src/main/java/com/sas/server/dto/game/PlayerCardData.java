package com.sas.server.dto.game;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PlayerCardData {
    String attr;
    String username;
    String nickname;
    int kill;
}
