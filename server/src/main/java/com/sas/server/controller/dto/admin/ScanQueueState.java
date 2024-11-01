package com.sas.server.controller.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ScanQueueState {
    int max;
    int period;

    @JsonProperty("isProcessing")
    boolean isProcessing;
}
