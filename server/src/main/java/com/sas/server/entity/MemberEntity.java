package com.sas.server.entity;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.redis.core.index.Indexed;

import com.sas.server.util.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "member_table")
@Entity
public class MemberEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long memberNumber;

    @Column(name = "type", nullable = false)
    @Builder.Default
    public Role type = Role.USER;

    @Column(name = "id", nullable = false, unique = true)
    @Indexed
    public String id;

    @Column(name = "password", nullable = false)
    public String password;

    @Column(name = "created_time", nullable = false)
    @CreationTimestamp
    public Date createdTime;

}
