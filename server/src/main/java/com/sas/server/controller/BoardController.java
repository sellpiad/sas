package com.sas.server.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sas.server.dto.Board.BoardDTO;
import com.sas.server.service.board.BoardService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    
    @GetMapping("/getList")
    public List<BoardDTO> getList(@RequestParam String param) {

        return boardService.findAll();
    }

    
}
