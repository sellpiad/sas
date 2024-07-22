package com.sas.server.dto.Board;

import io.micrometer.common.lang.NonNull;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Builder
@AllArgsConstructor
public class BoardDTO {
    
    @NonNull
    public Long id;

    @NonNull
    public String title;

    @NonNull
    public String author;

}
