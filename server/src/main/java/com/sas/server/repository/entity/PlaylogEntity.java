package com.sas.server.repository.entity;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.redis.core.index.Indexed;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sas.server.custom.dataType.AttributeType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "playlog")
@Entity
@Data
public class PlaylogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "play_time", nullable = false)
    @CreationTimestamp
    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern="yyyy-MM-dd HH:mm", timezone="Asia/Seoul")
    Date playTime;

    @Indexed
    @Column(name = "username", nullable = false)
    String username;

    @Column(name = "nickname", nullable = false)
    String nickname;

    @Column(name = "attr", nullable = false)
    @Enumerated(EnumType.STRING)
    AttributeType attr;

    @Column(name = "total_kill", nullable = false)
    int totalKill;

    @Column(name = "total_move", nullable = true)
    int totalMove;

    @Column(name = "total_conquered_cubes", nullable = true)
    int totalConqueredCubes;

}
