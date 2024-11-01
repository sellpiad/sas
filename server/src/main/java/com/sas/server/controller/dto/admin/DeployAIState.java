package com.sas.server.controller.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Data
@Getter
@Builder
public class DeployAIState {
    long period;
    int totalPlayer;
    int totalCube;
    double goal;

    @JsonProperty("isProcessing")
    boolean isProcessing;
}
