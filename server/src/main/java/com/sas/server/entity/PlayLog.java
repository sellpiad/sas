package com.sas.server.entity;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.redis.core.index.Indexed;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "playlog")
@Entity
public class PlayLog {

    @Id
    public String id;
    
    @Column(name = "play_time", nullable = false)
    @CreationTimestamp
    public Date playTime;

    @Indexed
    long memberNumber;

    @Column(name = "attr", nullable = false)
    String attr;

    @Column(name = "total_kill", nullable = false)
    int totalKill;

    @Column(name = "total_move", nullable = false)
    int totalMove;

    @Column(name = "total_conquered_cubes", nullable = false)
    int totalConqueredCubes;

}
