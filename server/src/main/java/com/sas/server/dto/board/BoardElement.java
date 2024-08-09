package com.sas.server.dto.board;

import io.micrometer.common.lang.NonNull;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Builder
@AllArgsConstructor
public class BoardElement {

    @NonNull
    public String category;
    
    @NonNull
    public Long id;

    @NonNull
    public String title;

    @NonNull
    public String author;

}
