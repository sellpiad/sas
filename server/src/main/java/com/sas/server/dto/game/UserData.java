package com.sas.server.dto.game;

import io.micrometer.common.lang.NonNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserData {
    
    @NonNull
    String username;
    
    @NonNull
    int killMax;

    int highestRanking;

    @NonNull
    int conquerMax;

    @NonNull
    String mainAttr;
}
