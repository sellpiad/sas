package com.sas.server.controller.dto.admin;

import com.sas.server.custom.util.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder(toBuilder = true)
@AllArgsConstructor
@Data
public class MemberData {
    
    long memberNumber;
    Role role;
    String username;
    Boolean isConnected;
    Boolean isPlaying;

}
