package com.sas.server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.sas.server.dto.Board.BoardDTO;
import com.sas.server.entity.PostEntity;

public interface BoardRepository extends JpaRepository<PostEntity,Long> {
    
    @Query("SELECT new com.sas.server.dto.Board.BoardDTO(p.id, p.title, p.author) FROM PostEntity p")
    Page<BoardDTO> findList(Pageable pageable);

}
