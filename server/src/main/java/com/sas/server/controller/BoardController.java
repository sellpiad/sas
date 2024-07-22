package com.sas.server.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sas.server.dto.Board.BoardDTO;
import com.sas.server.entity.PostEntity;
import com.sas.server.service.board.BoardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping("/getList")
    public Page<BoardDTO> getList(@RequestParam int page, int pageSize) {

        return boardService.findByRange(page, pageSize);
    }

    @GetMapping("/getPost")
    public PostEntity getPost(@RequestParam long id) {
        return boardService.findById(id);
    }

    @PostMapping("/createPost")
    public boolean createPost(@RequestParam String title, String content) {

        boardService.save(title, content, "tester");

        return true;
    }

    @PostMapping("/updatePost")
    public boolean updatePost(@RequestParam Long id, String title, String content, String author) {

        boardService.update(id, title, content, author);

        return true;
    }
}
