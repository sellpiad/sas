package com.sas.server.repository;

import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.sas.server.repository.BoardRepository;
import com.sas.server.repository.entity.PostEntity;

@SpringBootTest
public class BoardRepositoryTest {

    @Autowired
    private BoardRepository boardRepository;

    @BeforeEach
    public void cleanup() {
        boardRepository.deleteAll();
    }

    @Test
    public void save() {

        // given
        String title = "test";
        String author = "djfkdjk";
        String content = "가나다라마바사";

        boardRepository.save(PostEntity.builder()
                .title(title)
                .author(author)
                .content(content)
                .build());

        // when
        List<PostEntity> boardList = boardRepository.findAll();

        // then
        PostEntity board = boardList.get(0);

        Assertions.assertEquals(title, board.title);
        Assertions.assertEquals(author, board.author);
        Assertions.assertEquals(content, board.content);

    }

}
