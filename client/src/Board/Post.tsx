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

    useEffect(() => {

        axios.get('/api/getPost', {
            params: {
                id: id
            }
        }).then((res) => {
            setTitle(res.data.title)
            setContent(res.data.content)
            setAuthor(res.data.author)
        }).catch((err) => {
            console.log(err)
        })

    }, [])

    return (
        <Container>
            <Stack gap={2}>
                <Row>
                    <Col>
                        <h3>{title}</h3> <h6>By</h6> <h6 style={{color:"blue"}}>{author}</h6>
                    </Col>
                </Row>
                <div className="scroll-content">
                    <p>{content}</p>
                </div>
                <Row>
                    <Button variant="outline-primary" onClick={() => onMode('LIST')}>뒤로가기</Button>
                </Row>
                <Row>
                    <Button variant="outline-primary" onClick={() => onMode('EDIT')}>수정</Button>
                </Row>
            </Stack>
        </Container>
    )


}