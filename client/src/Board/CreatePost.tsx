import React, { EventHandler, useEffect, useState } from "react";
import { Button, Col, Container, Form, FormControlProps, InputGroup, Row, Spinner, Toast, ToastContainer } from "react-bootstrap";
import axios from 'axios'

export default function CreatePost({onMode}) {

    // 제목 및 내용
    const [title, setTitle] = useState<string>('')
    const [content, setContent] = useState<string>('')

    // 알림 및 메시지
    const [toast, setToast] = useState<boolean>(false)
    const [msg, setMsg] = useState<string>('')

    // 제목 및 내용 수정
    const titleHandler = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)
    const contentHandler = (e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value)

    // 알림 토글
    const toggleToast = () => setToast(!toast)

    // 포스트 저장 및 전송
    const save = () => {

        const formData = new FormData()

        formData.append("title", title)
        formData.append("content", content)

        setMsg('글을 등록 중입니다.')
        toggleToast()


        axios.post('/api/createPost', formData)
            .then((res) => {

                if (res.data === true) {
                    toggleToast()
                    onMode('LIST')
                } else {
                    setMsg('글을 등록하지 못했습니다.')
                }

            }).catch((err) => {
                setMsg('알 수 없는 오류로 글을 등록하지 못했습니다.')
            })

    }


    return (
        <Container>
            <Row>
                <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">제목</InputGroup.Text>
                        <Form.Control
                            placeholder="제목"
                            aria-label="제목"
                            aria-describedby="basic-addon1"
                            onChange={titleHandler}
                            maxLength={15}
                        />
                        <InputGroup.Text id="basic-addon1">작성자</InputGroup.Text>
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>내용</Form.Label>
                    <Form.Control as="textarea" rows={8} onChange={contentHandler} maxLength={1000}/>
                </Form.Group>
            </Row>
            <Row>
                <Button variant="outline-primary" onClick={save}>등록</Button>
            </Row>
            {toast === true && <CustomToast></CustomToast>}
        </Container>
    )

    function CustomToast() {
        return (
            <ToastContainer position="middle-center">
                <Toast>
                    <Spinner animation="border"></Spinner>
                    <h6>{msg}</h6>
                </Toast>
            </ToastContainer>
        )
    }
}