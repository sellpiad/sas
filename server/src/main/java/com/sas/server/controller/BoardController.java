package com.sas.server.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sas.server.dao.CustomUserDetails;
import com.sas.server.dto.board.BoardElement;
import com.sas.server.dto.board.PostData;
import com.sas.server.service.board.BoardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class BoardController {

    private final BoardService boardService;

    @GetMapping("/getList")
    public Page<BoardElement> getList(@RequestParam int page, int pageSize) {

        return boardService.findByRange(page, pageSize);
    }

    @GetMapping("/getPost")
    public PostData getPost(@RequestParam long id, @AuthenticationPrincipal CustomUserDetails user) {
        return boardService.findById(id, user.getUsername());
    }

    @PostMapping("/createPost")
    public boolean createPost(@RequestParam String category, String title, String content,
            @AuthenticationPrincipal CustomUserDetails user) {
    

        boardService.save(category, title, content, user.getUsername());

        return true;
    }

    @GetMapping("/getCategory")
    public List<String> getCategory(@AuthenticationPrincipal CustomUserDetails user) {

        return boardService.getCategories(user.getAuthorities());
    }
    

    @PostMapping("/updatePost")
    public boolean updatePost(@RequestParam Long id, String title, String content,
            @AuthenticationPrincipal CustomUserDetails user) {

        try {
            boardService.update(id, title, content, user.getUsername());
        } catch (IllegalArgumentException e) {
            log.error(e.getMessage());
            return false;
        }

        return true;
    }

    @DeleteMapping("/delete")
    public boolean deletePost(@RequestParam Long id, @AuthenticationPrincipal CustomUserDetails user) {

        try {
            boardService.delete(id, user.getUsername());
        } catch (IllegalArgumentException e) {
            log.error(e.getMessage());
            return false;
        }

        return true;

    }
}
