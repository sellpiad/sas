package com.sas.server.service.Board;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.sas.server.controller.dto.board.BoardData;
import com.sas.server.repository.BoardRepository;
import com.sas.server.repository.entity.PostEntity;
import com.sas.server.service.board.BoardService;

@ExtendWith(MockitoExtension.class)
public class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @InjectMocks
    private BoardService boardService;

    private String title;
    private String content;
    private String author;

    @BeforeEach
    void setup() {
        title = "제목 테스트";
        content = "내용 테스트";
        author = "글쓴이 테스트";
    }

    @Nested
    @DisplayName("게시물 리스트 받아오기")
    class getBoard {

        @Test
        void success() {
            PostEntity post1 = PostEntity.builder()
                    .title("Title1")
                    .author("Author1")
                    .build();

            PostEntity post2 = PostEntity.builder()
                    .title("Title2")
                    .author("Author2")
                    .build();


            when(boardRepository.findAll()).thenReturn(Arrays.asList(post1, post2));

            // Act
            List<BoardData> board = boardService.findAll();

            // Assert
            assertEquals(2, board.size());

            BoardData boardDTO1 = board.get(0);
            assertEquals("Title1", boardDTO1.title);
            assertEquals("Author1", boardDTO1.author);

            BoardData boardDTO2 = board.get(1);
            assertEquals("Title2", boardDTO2.title);
            assertEquals("Author2", boardDTO2.author);

            verify(boardRepository, times(1)).findAll();
        }

    }
}
