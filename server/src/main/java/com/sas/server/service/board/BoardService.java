package com.sas.server.service.board;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sas.server.dto.Board.BoardDTO;
import com.sas.server.entity.PostEntity;
import com.sas.server.repository.BoardRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepo;

    public void save(String title, String content, String author) {

        boardRepo.save(PostEntity.builder()
                .title(title)
                .content(content)
                .author(author)
                .build());

    }

    public PostEntity findById(Long id) {
        return boardRepo.findById(id)
                .orElseThrow(() -> new NullPointerException("Post not found with id"));
    }

    public Page<BoardDTO> findByRange(int page, int pageSize){

        if(page > 0 ) 
            page -= 1;

        Pageable pageable = PageRequest.of(page, pageSize);
        Page<BoardDTO> postList = boardRepo.findList(pageable);

        return postList;
    }

    public List<BoardDTO> findAll() {

        List<PostEntity> postList = boardRepo.findAll();

        List<BoardDTO> board = new ArrayList<>();

        for (PostEntity post : postList) {

            board.add(BoardDTO.builder()
                    .id(post.id)
                    .title(post.title)
                    .author(post.author)
                    .build());

        }

        return board;

    }

    public void update(Long id, String title, String content, String author) {

        PostEntity post = boardRepo.findById(id)
                .orElseThrow(() -> new NullPointerException("Post not found with id"));

        boardRepo.save(post.toBuilder()
                .title(title)
                .content(content)
                .build());
    }

    public void delete(Long id) {

        boardRepo.deleteById(id);
    }

}
