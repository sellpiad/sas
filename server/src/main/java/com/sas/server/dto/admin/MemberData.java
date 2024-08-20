package com.sas.server.dto.admin;

import com.sas.server.util.Role;

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
