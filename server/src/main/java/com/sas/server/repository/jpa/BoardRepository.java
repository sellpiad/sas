package com.sas.server.repository.jpa;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.sas.server.controller.dto.board.BoardData;
import com.sas.server.repository.entity.PostEntity;

public interface BoardRepository extends JpaRepository<PostEntity, Long> {

    @Query("SELECT BoardData(p.category, p.id, p.title, p.author) FROM PostEntity p")
    Page<BoardData> findList(Pageable pageable);

    List<BoardData> findByCategory(String category);

    @Query("SELECT BoardData(p.category, p.id, p.title, p.author) " +
            "FROM PostEntity p " +
            "ORDER BY CASE WHEN p.category = '공지' THEN 0 ELSE 1 END, p.id DESC")
    Page<BoardData> findWithNoticeAtTop(Pageable pageable);

}
