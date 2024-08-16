import { Client } from "@stomp/stompjs";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Modal, ModalBody, Row, Stack } from "react-bootstrap";
import { useDispatch } from "react-redux";
import Slime from "../gamefield/slimeset/Slime.tsx";
import { ObserverType, updateObserver } from "../redux/ObserverSlice.tsx";
import './CreateModal.css';
import { updatePlaying } from "../redux/UserSlice.tsx";

/**
 * Component CreateModal
 * 유저가 게임에 참여하고자 할때, 생성을 요청하는 모달.
 *
 * Children Component
 * -Slime: 모습 보여주기 용
 */

interface Props {
    client: Client | undefined
    show: boolean
    onHide: () => void
}

export default function CreateModal({ client, show, onHide, ...props }: Props) {

    const [nickname, setNickname] = useState<string>('')

    // 입력 제한 및 에러 출력용 state
    const [valid, setValid] = useState<boolean>(false)
    const [err, setErr] = useState<string>('')

    const [color, setColor] = useState<string>()
    const [text, setText] = useState<string>()
    const [attr, setAttr] = useState<string>()
    const [exp, setExp] = useState<string>()

    const [index, setIndex] = useState<number>(0)

    const dispatch = useDispatch()

    const btnHanlder = () => {

        if (nickname.length < 1) {
            alarmErr()
        } else {
            const user = { nickname: nickname, attr: attr }

            axios.post('/api/player/register', user)
                .then((res) => {
                    dispatch(updateObserver({ observer: res.data as ObserverType }))
                    dispatch(updatePlaying({ isPlaying: true }))
                }).catch((err) => {

                })

            onHide()
        }
    }

    // 에러 메세지 출력
    const alarmErr = () => {
        setErr('닉네임을 입력해주세요.')
        setValid(true)
        setTimeout(() => {
            setValid(false)
            setErr('')
        }, 2000)
    }


    // 속성 선택 버튼
    const incIndex = () => {
        if (index < 2)
            setIndex(prev => prev + 1)
    }

    const decIndex = () => {
        if (index > 0)
            setIndex(prev => prev - 1)
    }

    const getAttr = () => {

        switch (index) {
            case 0:
                setColor("#38f113")
                setText("풀속성")
                setAttr("GRASS")
                setExp("물속성과 전투시 승리 불속성과 전투시 패배")
                break;
            case 1:
                setColor("#dc3545")
                setText("불속성")
                setAttr("FIRE")
                setExp("풀속성과 전투시 승리 물속성과 전투시 패배")
                break;
            case 2:
                setColor("#180bc7")
                setText("물속성")
                setAttr("WATER")
                setExp("불속성과 전투시 승리 풀속성과 전투시 패배")
                break;
        }

    }

    useEffect(() => {
        getAttr()
    }, [index])

    return (
        <Modal show={show} onHide={onHide} size="sm" centered style={{ fontFamily: "DNFBitBitv2" }} >
            <ModalBody>
                <Stack gap={2}>
                    <Row className="info-span">
                        <Slime playerId="createModalWater" direction="down" fill={attr} width="30%" height="30%" isAbsolute={false}></Slime>
                        <span>{exp?.substring(0, 11)}</span>
                        <span>{exp?.substring(12, 23)}</span>
                    </Row>
                    <Row>
                        <Col className="info-span" xs={4}>
                            <span>속성</span>
                        </Col>
                        <Col className="info-span" xs={8}>
                            <div>
                                <Button className="arrow-btn" onClick={decIndex}>◀</Button>
                                <span style={{ color: color }}>{attr}</span>
                                <Button className="arrow-btn" onClick={incIndex}>▶</Button>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="info-span" xs={4}>
                            <span>닉네임</span>
                        </Col>
                        <Col className="info-span" xs={8}>
                            <InputGroup onSubmit={btnHanlder} hasValidation>
                                <Form.Control
                                    required
                                    placeholder="닉네임을 입력해주세요."
                                    aria-label="닉네임"
                                    aria-describedby="basic-addon2"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    isInvalid={valid}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="info-span">
                        <p className={valid ? "shake err-msg" : "err-msg"}>{err}</p>
                    </Row>
                    <Row>
                        <Col xs={{ offset: 3, span: 6 }}>
                            <Button onClick={btnHanlder} variant="outline-secondary" style={{ color: "black" }}>
                                슬라임 생성
                            </Button>
                        </Col>
                    </Row>
                </Stack>
            </ModalBody>
        </Modal>
    )
}