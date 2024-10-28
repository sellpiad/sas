package com.sas.server.repository.entity;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Table(name="freeboard_table")
@Entity
public class PostEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long id;

    @Column(name="category", nullable = false)
    @Builder.Default
    public String category = "일반";

    @Column(name="title", nullable = false)
    public String title;

    @Column(name="author", nullable = false)
    public String author;

    @Column(name="content", nullable = false, length = 2000)
    public String content;

    @Column(name="created_time",nullable = false)
    @CreationTimestamp
    public Date createdTime;


}
