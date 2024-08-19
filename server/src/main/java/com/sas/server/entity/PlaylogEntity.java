package com.sas.server.entity;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.redis.core.index.Indexed;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
    Date playTime;

    @Indexed
    String username;

    @Column(name = "attr", nullable = false)
    String attr;

    @Column(name = "total_kill", nullable = false)
    int totalKill;

    @Column(name = "total_move", nullable = true)
    int totalMove;

    @Column(name = "total_conquered_cubes", nullable = true)
    int totalConqueredCubes;

}
