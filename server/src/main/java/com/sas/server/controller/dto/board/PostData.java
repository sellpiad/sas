package com.sas.server.controller.dto.board;

import io.micrometer.common.lang.NonNull;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Builder
@AllArgsConstructor
public class PostData {
    
    @NonNull
    public Long id;

    @NonNull
    public String title;

    @NonNull
    public String author;

    @NonNull
    public String content;

    @NonNull
    public boolean editable;

}
