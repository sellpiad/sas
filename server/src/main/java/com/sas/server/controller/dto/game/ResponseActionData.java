package com.sas.server.controller.dto.game;

import com.sas.server.custom.dataType.ActionType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class ResponseActionData {

    String username; // 플레이어 이름
    
    ActionType actionType; // 액션 종류
    String target; // 액션 타겟
    String direction; // 플레이어 방향

    long locktime; // 다음 액션까지 필요한 딜레이
    long duration; // 액션 소요 시간
    
}
