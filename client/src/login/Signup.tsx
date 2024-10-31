import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { Button, Container, FloatingLabel, Form, Row, Stack } from "react-bootstrap";

export default function Signup({ onMode }) {

    const userExist = "이미 사용 중인 아이디입니다."
    const wrongPwd = "입력된 비밀번호가 다릅니다."
    const invalidId = "아이디를 입력해주세요."
    const invalidPwd = "비밀번호를 입력해주세요."

    const [id, setId] = useState<string>('')
    const [pwd, setPwd] = useState<string>('')
    const [pwd2, setPwd2] = useState<string>('')

    const [err, setErr] = useState<string>(' ')
    const [errEffect, setErrEffect] = useState<boolean>(false)

    const handleId = (e) => setId(e.target.value)
    const handlePwd = (e) => setPwd(e.target.value)
    const handlePwd2 = (e) => setPwd2(e.target.value)

    const checkSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()

        if(id === ''){
            alarmErr(invalidId)
            return ;
        }

        if(pwd === ''){
            alarmErr(invalidPwd)
            return ;
        }


        if (pwd !== pwd2) {
            alarmErr(wrongPwd)
            return;
        }

        const formdata = new FormData()

        formdata.append('id', id)
        formdata.append('password', pwd)

        axios.post('/api/signup', formdata)
            .then((res) => {
                if (res.data) {
                    onMode('LOGIN')
                }
            }).catch((err: AxiosError) => {
                if (err.response?.status === 409) {
                    alarmErr(userExist)
                }
            })


    }

    const alarmErr = (msg) => {
        setErr(msg)
        setErrEffect(true)
        setTimeout(() => {
            setErrEffect(false)
        }, 1000)
    }


    return (
        <Container>
            <Stack gap={2}>
                <Row>
                    <h4>회원가입</h4>
                </Row>
                <Form noValidate onSubmit={checkSubmit}>
                    <Stack gap={2}>
                        <Row>
                            <Form.Group>
                                <FloatingLabel
                                    controlId="floatingInput"
                                    label="아이디"
                                >
                                    <Form.Control type="id" required onChange={handleId} />
                                </FloatingLabel>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group>
                                <FloatingLabel controlId="floatingPassword" label="비밀번호">
                                    <Form.Control type="password" placeholder="Password" required onChange={handlePwd} />
                                </FloatingLabel>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group>
                                <FloatingLabel controlId="floatingPassword" label="비밀번호 확인">
                                    <Form.Control type="password" placeholder="Password" required onChange={handlePwd2} />
                                </FloatingLabel>
                            </Form.Group>
                        </Row>
                        <Row>
                            <p className={errEffect ? "shake err-msg" : "err-msg"}>{err}</p>
                        </Row>
                        <Form.Group>
                            <Row className="Btn-Box">
                                <Button className="Btn" type="submit">회원등록</Button>
                            </Row>
                        </Form.Group>
                        <Row className="Btn-Box">
                            <Button className="Btn" onClick={() => onMode('LOGIN')}>뒤로가기</Button>
                        </Row>
                    </Stack>
                </Form>
            </Stack>
        </Container>
    )
}