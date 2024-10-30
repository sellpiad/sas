import { Client } from "@stomp/stompjs";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, FloatingLabel, Form, Modal, ModalBody, Row, Stack } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setReady } from "../redux/GameSlice.tsx";
import { RootState } from "../redux/Store.tsx";
import { changeLogin, updateAuth } from "../redux/UserSlice.tsx";
import './Login.css';
import Signup from "./Signup.tsx";


interface Props {
    client: Client | undefined
}

const LoadingDots = () => {

    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prevDots => (prevDots.length < 3 ? prevDots + '.' : ''));
        }, 300);

        return () => clearInterval(interval);
    }, []);

    return <span>{dots}</span>;

}


export default function Login({ client }: Props) {

    const invalidId = "아이디를 입력해주세요."
    const invalidPwd = "비밀번호를 입력해주세요."
    const invalidInfo = "아이디, 혹은 비밀번호를 확인해주세요."
    const getServer = '서버와 통신 중'
    const getSlime = '슬라임들을 소환 중'
    const getCubeset = '로그인 성공! 큐브셋 정보를 받아오는 중'
    const getComplete = '게임 로딩 완료!'

    const [id, setId] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    // 로그인 유지용 redux dispatch 및 state
    const isLogin = useSelector((state: RootState) => state.user.isLogin)
    const isReady = useSelector((state: RootState) => state.game.isReady)
    const dispatch = useDispatch()

    const [mode, setMode] = useState<string>('LOGIN')

    // 입력 검증 관련 states
    const [validated, setValidated] = useState<boolean>(false)
    const [idValidation, setIdValidation] = useState<boolean>(false)
    const [pwdValidation, setPwdValidation] = useState<boolean>(false)

    // 게임 초기화 메시지
    const [msg, setMsg] = useState<string>('')
    const [msgType, setMsgType] = useState<string>('')

    const [error,setError] = useState<string>()

    const handleId = (e) => setId(e.target.value)
    const handlePwd = (e) => setPassword(e.target.value)

    // 로그인
    const handleLogin = () => {

        setMsg(getServer)
        setMsgType('normal-msg')

        const formData = new FormData()

        formData.append('username', id)
        formData.append('password', password)

        axios.post('/api/login', formData)
            .then((res) => {
                if (['USER', 'ADMIN'].includes(res.data)) {
                    dispatch(changeLogin({ isLogin: true }))
                    dispatch(updateAuth({ auth: res.data }))
                } else {
                    alarmErr(invalidInfo)
                }
            }).catch((err) => {
                alarmErr(invalidInfo)
            })

    }

    // 폼 체크
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

    // 에러 메세지 출력
    const alarmErr = (msg) => {
        setMsg(msg)
        setMsgType('shake err-msg')
        setTimeout(() => {
            setMsgType('err-msg')
        }, 1000)
    }

    // 게임 로딩 완료 설정
    useEffect(() => {

        if (!isReady) {
            setMsg(getComplete)
            dispatch(setReady())
        }

    }, [isReady])

    // 4. 로딩 메시지 초기화
    useEffect(() => {

        if (isReady) {
            setMsg('')
        }

    }, [isReady])


    // 로그아웃 시
    useEffect(() => {

        if (!isLogin) {
            setMsg('')
            setMsgType('')
        }

    }, [isLogin])


    return (
        <Modal show={!isLogin} centered size="sm">
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
                                            label="아이디"
                                        >
                                            <Form.Control type="id" required isValid={idValidation} onChange={handleId} />
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
                                <Row style={{ textAlign: "center" }}>
                                    <Col>
                                        <span className={msgType}>{msg}</span>
                                        {msgType === 'normal-msg' && <LoadingDots />}
                                    </Col>
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