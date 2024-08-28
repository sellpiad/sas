package com.sas.server.dto.game;

import lombok.Builder;
import lombok.Data;
import lombok.NonNull;

@Data
@Builder
public class ObserverData {

    @NonNull
    String username;

    @NonNull
    String nickname;

    String position;

    @NonNull
    String attr;

    int kill;

    int conquer;

}