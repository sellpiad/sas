import { Client } from "@stomp/stompjs";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Modal, ModalBody, Row, Stack } from "react-bootstrap";
import Slime from "../gamefield/slimeset/Slime.tsx";
import { ActionType, AttributeType, ObjectProps } from "../redux/GameSlice.tsx";
import './CreateModal.css';
import { SlimeData } from "../dataReceiver/gameReceiver.tsx";

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
    const [attr, setAttr] = useState<string>('')

    const [winAttr, setWinAttr] = useState<string>()
    const [loseAttr, setLoseAttr] = useState<string>()

    const [slime, setSlime] = useState<SlimeData>({
        username: 'createSlime',
        attr: AttributeType.NORMAL,
        actionType: ActionType.IDLE,
        direction: 'down',
        duration: 300,
        position: '',
        locktime: 0
    } as SlimeData)

    const [index, setIndex] = useState<number>(0)

    const createObjectProps: ObjectProps = {
        position: 'relative',
        width: '30%',
        height: '30%'
    }


    const btnHanlder = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()

        if (nickname.length < 1) {
            alarmErr()
        } else {
            const user = { nickname: nickname, attr: attr }

            axios.post('/api/player/register', user)
                .then((res) => {
                    console.log(res.data + "명이 플레이를 기다리는 중..")
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

    const getWinAttr = (curAttr: string) => {
        switch (curAttr) {
            case 'GRASS':
                return '#180bc7'
            case 'FIRE':
                return '#38f113'
            case 'WATER':
                return '#dc3545'
        }
    }

    const getLoseAttr = (curAttr: string) => {
        switch (curAttr) {
            case 'GRASS':
                return '#dc3545'
            case 'FIRE':
                return '#180bc7'
            case 'WATER':
                return '#38f113'
        }
    }


    const getAttr = () => {

        switch (index) {
            case 0:
                setColor("#38f113")
                setText("풀속성")
                setAttr("GRASS")
                setWinAttr("물속성")
                setLoseAttr("불속성")
                setSlime(prev => ({ ...prev, attr: AttributeType.GRASS }))
                break;
            case 1:
                setColor("#dc3545")
                setText("불속성")
                setAttr("FIRE")
                setWinAttr("풀속성")
                setLoseAttr("물속성")
                setSlime(prev => ({ ...prev, attr: AttributeType.FIRE }))
                break;
            case 2:
                setColor("#180bc7")
                setText("물속성")
                setAttr("WATER")
                setWinAttr("불속성")
                setLoseAttr("풀속성")
                setSlime(prev => ({ ...prev, attr: AttributeType.WATER }))
                break;
        }

    }

    useEffect(() => {
        getAttr()
    }, [index])

    return (
        <Modal show={show} onHide={onHide} size="sm" centered>
            <ModalBody>
                <Stack gap={2}>
                    <Row className="info-span">
                        <Slime objectProps={createObjectProps} slimeData={slime} ></Slime>
                        <div>
                            <span style={{ color: getWinAttr(attr) }}>{winAttr}</span>
                            <span>과 전투시 승리</span>
                        </div>
                        <div>
                            <span style={{ color: getLoseAttr(attr) }}>{loseAttr}</span>
                            <span>과 전투시 패배</span>
                        </div>
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

                    <Form onSubmit={btnHanlder}>
                        <Stack gap={2}>
                            <Row>
                                <Col className="info-span" xs={4}>
                                    <span>닉네임</span>
                                </Col>
                                <Col className="info-span" xs={8}>
                                    <Form.Control
                                        className={valid ? 'shake' : ''}
                                        placeholder="닉네임을 입력해주세요."
                                        aria-label="닉네임"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        isInvalid={valid}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={{ offset: 3, span: 6 }}>
                                    <Button variant="outline-secondary" type="submit" style={{ color: "black" }}>
                                        슬라임 생성
                                    </Button>
                                </Col>
                            </Row>
                        </Stack>
                    </Form>
                </Stack>
            </ModalBody>
        </Modal>
    )
}