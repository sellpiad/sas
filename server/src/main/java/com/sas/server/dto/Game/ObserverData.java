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

    @NonNull
    String position;

    @NonNull
    String attr;

    @NonNull
    int kill;

    @NonNull
    int conquer;

}