package com.sas.server.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.sas.server.dto.board.BoardElement;
import com.sas.server.entity.PostEntity;

public interface BoardRepository extends JpaRepository<PostEntity, Long> {

    @Query("SELECT new com.sas.server.dto.board.BoardElement(p.category, p.id, p.title, p.author) FROM PostEntity p")
    Page<BoardElement> findList(Pageable pageable);

    List<BoardElement> findByCategory(String category);

    @Query("SELECT new com.sas.server.dto.board.BoardElement(p.category, p.id, p.title, p.author) " +
            "FROM PostEntity p " +
            "ORDER BY CASE WHEN p.category = '공지' THEN 0 ELSE 1 END, p.id DESC")
    Page<BoardElement> findWithNoticeAtTop(Pageable pageable);

}
