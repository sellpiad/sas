import axios from "axios"
import React from "react"
import { useEffect, useState } from "react"
import { Button, Col, Container, Row, Stack } from "react-bootstrap"
import './Post.css'

export default function Post({ onMode, id }) {

    // 제목 및 내용
    const [title, setTitle] = useState<string>('')
    const [content, setContent] = useState<string>('')
    const [author, setAuthor] = useState<string>('')
    const [editable, setEditable] = useState<boolean>(false)

    // 삭제 버튼용 메소드
    const handleDelete = () => {
        axios.delete('/api/delete',
            { params: { id: id } })
            .then((res) => {
                if (res.data) {
                    onMode('LIST')
                } else {
                    console.log("삭제 중 에러")
                }
            }).catch((err) => {
                console.error(err)
            })
    }

    // 포스트 얻어오기
    useEffect(() => {

        axios.get('/api/getPost', {
            params: {
                id: id
            }
        }).then((res) => {
            setTitle(res.data.title)
            setContent(res.data.content)
            setAuthor(res.data.author)
            setEditable(res.data.editable)
        }).catch((err) => {
            console.log(err)
        })

    }, [id])

    return (
        <Container>
            <Stack gap={2}>
                <Row>
                    <Col>
                        <h3>{title}</h3> <h6>By</h6> <h6 style={{ color: "blue" }}>{author}</h6>
                    </Col>
                </Row>
                <div className="scroll-content">
                    <p>{content}</p>
                </div>
                <Row>
                    <Button variant="outline-primary" onClick={() => onMode('LIST')}>뒤로가기</Button>
                </Row>

                {editable && <>
                    <Row>
                        <Button variant="outline-primary" onClick={() => onMode('EDIT')}>수정</Button>
                    </Row>
                    <Row>
                        <Button variant="outline-primary" onClick={handleDelete}>삭제</Button>
                    </Row>
                </>}
            </Stack>
        </Container>
    )


}