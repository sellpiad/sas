package com.sas.server.repository.entity;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.redis.core.index.Indexed;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Table(name = "log")
@Entity
@Data
public class LogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "time", nullable = false)
    @CreationTimestamp
    @JsonFormat(shape= JsonFormat.Shape.STRING, pattern="yyyy-MM-dd HH:mm", timezone="Asia/Seoul")
    Date time;

    @Indexed
    String username;

    @Column(name = "activityType", nullable = false)
    String activityType;

    @Column(name = "detail")
    String detail;

    @Column(name = "isAdmin", nullable = false)
    boolean isAdmin;


}

