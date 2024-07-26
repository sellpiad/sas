package com.sas.server.service.board;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sas.server.dto.board.BoardElement;
import com.sas.server.dto.board.PostData;
import com.sas.server.entity.PostEntity;
import com.sas.server.repository.BoardRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardService {

    private final BoardRepository boardRepo;

    public void save(String title, String content, String author) {

        boardRepo.save(PostEntity.builder()
                .title(title)
                .content(content)
                .author(author)
                .build());

    }

    /**
     * 조회인의 ID와 게시글의 ID를 비교 후, editable flag를 추가 후 전송.
     * 
     * @param id
     * @return
     */
    public PostData findById(Long id, String accessor) {

        PostEntity post = boardRepo.findById(id)
                .orElseThrow(() -> new NullPointerException("Post not found with id"));

        if (post.author.equals(accessor)) {
            return PostData.builder()
                    .author(post.author)
                    .title(post.title)
                    .content(post.content)
                    .editable(true)
                    .build();
        } else {
            return PostData.builder()
                    .author(post.author)
                    .title(post.title)
                    .content(post.content)
                    .editable(false)
                    .build();
        }
    }

    public Page<BoardElement> findByRange(int page, int pageSize) {

        if (page > 0)
            page -= 1;

        Pageable pageable = PageRequest.of(page, pageSize);
        Page<BoardElement> postList = boardRepo.findList(pageable);

        return postList;
    }

    public List<BoardElement> findAll() {

        List<PostEntity> postList = boardRepo.findAll();

        List<BoardElement> board = new ArrayList<>();

        for (PostEntity post : postList) {

            board.add(BoardElement.builder()
                    .id(post.id)
                    .title(post.title)
                    .author(post.author)
                    .build());

        }

        return board;

    }

    /**
     * 게시글의 작성자 ID와 이를 요청한 요청자의 ID를 비교 후, 일치하면 업데이트.
     * 
     * @param id
     * @param title
     * @param content
     * @param author
     */
    public void update(Long id, String title, String content, String author) {

        PostEntity post = boardRepo.findById(id)
                .orElseThrow(() -> new NullPointerException("Post not found with id"));

        if (post.author.equals(author)) {
            boardRepo.save(post.toBuilder()
                    .title(title)
                    .content(content)
                    .build());
        } else {
            throw new IllegalArgumentException(author + "가 " + post.author + "의 게시글에 비정상적인 접근을 시도했습니다.");
        }

    }

    /**
     * 게시글의 작성자와 요청자의 아이디를 비교 후, 일치하면 삭제.
     * 
     * @param id
     * @param author
     */
    public void delete(Long id, String accessor) {

        PostEntity post = boardRepo.findById(id)
                .orElseThrow(() -> new NullPointerException("Post not found with id"));

        if (post.author.equals(accessor)) {
            boardRepo.deleteById(id);
        } else {
            throw new IllegalArgumentException(accessor + "가 " + post.author + "의 게시글에 비정상적인 접근을 시도했습니다.");
        }

    }

}
