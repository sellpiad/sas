import axios from "axios";
import React, { KeyboardEventHandler, useState } from "react";
import { Button, Container, FloatingLabel, Form, Modal, ModalBody, Row, Stack } from "react-bootstrap";
import './Login.css';
import Signup from "./Signup.tsx";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store.tsx";
import { changeLogin } from "../redux/UserSlice.tsx";

export default function Login() {

    const invalidId = "아이디를 입력해주세요."
    const invalidPwd = "비밀번호를 입력해주세요."
    const invalidInfo = "아이디, 혹은 비밀번호를 확인해주세요."

    const [id, setId] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    // 로그인 유지용 redux dispatch 및 state
    const isLogined = useSelector((state: RootState) => state.user.isLogined)
    const dispatch = useDispatch()

    const [mode, setMode] = useState<string>('LOGIN')

    // 입력 검증 관련 states
    const [validated, setValidated] = useState<boolean>(false)
    const [idValidation, setIdValidation] = useState<boolean>(false)
    const [pwdValidation, setPwdValidation] = useState<boolean>(false)

    const [err, setErr] = useState<string>('')
    const [errEffect, setErrEffect] = useState<boolean>(false)

    const handleId = (e) => setId(e.target.value)
    const handlePwd = (e) => setPassword(e.target.value)

    const handleLogin = () => {

        const formData = new FormData()

        formData.append('username', id)
        formData.append('password', password)

        axios.post('/api/login', formData)
            .then((res) => {
                if (res.data) {
                    dispatch(changeLogin({isLogined:true}))
                } else {
                    alarmErr(invalidInfo)
                }
            }).catch((err) => {
                alarmErr(invalidInfo)
            })

    }

    const checkSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()

        if (id === '') {
            alarmErr(invalidId)
        } else if (password === '') {
            alarmErr(invalidPwd)
        } else {
            handleLogin()
        }

    }

    const alarmErr = (msg) => {
        setErr(msg)
        setErrEffect(true)
        setTimeout(() => {
            setErrEffect(false)
        }, 1000)
    }



    return (
        <Modal show={!isLogined} centered size="sm">
            <ModalBody>
                {mode === 'LOGIN' && <Container style={{ fontFamily: "DNFBitBitv2" }}>
                    <Stack gap={2}>
                        <Row>
                            <h4>슬라임으로 살아남기</h4>
                            <p>테스트용 계정</p>
                            <p>아이디: test</p>
                            <p>비밀번호: 1234</p>
                        </Row>
                        <Form noValidate validated={validated} onSubmit={checkSubmit}>
                            <Stack gap={2}>
                                <Row>
                                    <Form.Group>
                                        <FloatingLabel
                                            controlId="floatingInput"
                                            label="이메일 주소"
                                        >
                                            <Form.Control type="email" placeholder="name@example.com" required isValid={idValidation} onChange={handleId} />
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group>
                                        <FloatingLabel controlId="floatingPassword" label="비밀번호">
                                            <Form.Control type="password" placeholder="Password" required isValid={pwdValidation} onChange={handlePwd} />
                                        </FloatingLabel>
                                    </Form.Group>
                                </Row>
                                <Row>
                                    <p className={errEffect ? "shake err-msg" : "err-msg"}>{err}</p>
                                </Row>
                                <Row className="Btn-Box">
                                    <Button className="Btn" type="submit">Login</Button>
                                </Row>
                            </Stack>
                        </Form>
                        <Row className="Btn-Box">
                            <Button className="Btn" onClick={() => setMode('REGISTER')}>Register</Button>
                        </Row>
                    </Stack>
                </Container>}
                {mode === 'REGISTER' && <Signup onMode={setMode}></Signup>}
            </ModalBody>
        </Modal>
    )
}