package com.sas.server.dto.game;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;
import lombok.NonNull;

@Data
@Builder
public class ObserverData {

    @NonNull
    String username;

    @NonNull
    UUID playerId;

    @NonNull
    String attr;

    @NonNull
    int kill;

    @NonNull
    int conquer;

}