import axios from "axios";
import React, { KeyboardEventHandler, useEffect, useState } from "react";
import { Button, Container, FloatingLabel, Form, Modal, ModalBody, Row, Stack, Toast, ToastContainer } from "react-bootstrap";
import './Login.css';
import Signup from "./Signup.tsx";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store.tsx";
import { changeLogin } from "../redux/UserSlice.tsx";
import { Client, IMessage } from "@stomp/stompjs";
import { initialCubeSet, initialGameSize, initialSlimeSet, SlimeDTO, setReady } from "../redux/GameSlice.tsx";
import { persistor } from "../index.js";


interface Props {
    client: Client | undefined
}


export default function Login({ client }: Props) {

    const invalidId = "아이디를 입력해주세요."
    const invalidPwd = "비밀번호를 입력해주세요."
    const invalidInfo = "아이디, 혹은 비밀번호를 확인해주세요."

    const [id, setId] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    // 로그인 유지용 redux dispatch 및 state
    const isLogined = useSelector((state: RootState) => state.user.isLogined)
    const isReady = useSelector((state:RootState) => state.game.isReady)
    const dispatch = useDispatch()

    const [mode, setMode] = useState<string>('LOGIN')

    // 입력 검증 관련 states
    const [validated, setValidated] = useState<boolean>(false)
    const [idValidation, setIdValidation] = useState<boolean>(false)
    const [pwdValidation, setPwdValidation] = useState<boolean>(false)

    const [err, setErr] = useState<string>('')
    const [errEffect, setErrEffect] = useState<boolean>(false)

    // 게임 초기화 메시지
    const [msg, setMsg] = useState<string>('')

    // 게임 셋팅용 정보
    const cubeset = useSelector((state: RootState) => state.game.cubeset)
    const slimeset = useSelector((state: RootState) => state.game.slimeset)


    const handleId = (e) => setId(e.target.value)
    const handlePwd = (e) => setPassword(e.target.value)

    // 로그인
    const handleLogin = () => {

        const formData = new FormData()

        formData.append('username', id)
        formData.append('password', password)

        axios.post('/api/login', formData)
            .then((res) => {
                if (res.data) {
                    dispatch(changeLogin({ isLogined: true }))
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
        setErr(msg)
        setErrEffect(true)
        setTimeout(() => {
            setErrEffect(false)
        }, 1000)
    }



    // 1. 큐브셋 요청
    useEffect(() => {

        if (isLogined && client) {
            setMsg('로그인 성공! 큐브셋 정보를 받아오는 중...')

            //초기 큐브셋 받아오기
            client.subscribe('/user/queue/cube/cubeSet', (msg: IMessage) => {

                const parser = JSON.parse(msg.body)

                dispatch(initialCubeSet({
                    cubeset: parser.reduce((result, value) => {

                        const posY = value['posY']

                        if (!result[posY])
                            result[posY] = [];

                        result[posY].push(value)

                        return result
                    }, [])

                }))

            })

            client.publish({ destination: '/app/cube/cubeSet' })
        }

    }, [isLogined, client])

    // 2. 슬라임 소환
    useEffect(() => {

        if (cubeset && client) {
            setMsg('슬라임들을 소환 중...')

            // 초기 슬라임들 받아오기
            client.subscribe('/user/queue/game/slimes', (msg: IMessage) => {

                const slimeSet: {[key:string]:SlimeDTO} = JSON.parse(msg.body) as {[key:string]:SlimeDTO} 

                dispatch(initialSlimeSet({ slimeset: slimeSet }))

                client.unsubscribe('/user/queue/game/slimes')
            })

            client.publish({ destination: '/app/game/slimes' })
        }

    }, [cubeset])

    // 3. 게임 로딩 완료 설정
    useEffect(() => {

        if (slimeset && client && !isReady) {
            setMsg('게임 로딩 완료!')
            dispatch(setReady())
        }

    }, [slimeset])

    // 4. 로딩 메시지 초기화
    useEffect(()=>{

        if(isReady){
            setMsg('')
        }

    },[isReady])


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
                                    <p>{msg}</p>
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