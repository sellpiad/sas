import React, { useEffect, useState } from "react";
import { Button, Carousel, Form, InputGroup, Modal, ModalBody } from "react-bootstrap";
import Slime from "../slime/Slime.tsx";
import { Client } from "@stomp/stompjs";
import { useDispatch } from "react-redux";
import { updateAttr } from "../redux/userSlice.tsx";
import './CreateModal.css'

interface Props {
    client: Client | undefined
    show: boolean
    onHide: () => void
}

export default function CreateModal({ client, show, onHide, ...props }: Props) {

    const [nickname, setNickname] = useState<string>()

    const [slime, setSlime] = useState<number>(0)
    const [btnColor, setBtnColor] = useState<string>()
    const [btnText, setBtnText] = useState<string>()
    const [attr, setAttr] = useState<string>()

    const dispatch= useDispatch()

    const btnHanlder = () => {

        const state = { nickname: nickname, attr: attr }
        dispatch(updateAttr({attr:attr}))
        client?.publish({ destination: '/app/queue/joiningQueue', body: JSON.stringify(state) })
        onHide()
    }

    useEffect(() => {

        switch (slime) {
            case 0:
                setBtnColor("#38f113")
                setBtnText("풀속성")
                setAttr("GRASS")
                break;
            case 1:
                setBtnColor("#dc3545")
                setBtnText("불속성")
                setAttr("FIRE")
                break;
            case 2:
                setBtnColor("#180bc7")
                setBtnText("물속성")
                setAttr("WATER")
                break;
        }

    }, [slime])


    return (
        <Modal show={show} onHide={onHide} size="sm" centered>
            <ModalBody>
                <Carousel controls={true} onSelect={(eventKey) => setSlime(eventKey)} interval={null}>
                    <Carousel.Item>
                        <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                            <Slime direction="down" fill="GRASS" width="5vw" height="5vh" isAbsolute={false} position={undefined}></Slime>
                            <div style={{ textAlign: "center" }}>
                                <strong>속성 - 풀</strong>
                                <p></p>
                                <strong>물속성</strong> 슬라임과 전투시 승리
                                <p></p>
                                <strong>불속성</strong> 슬라임과 전투시 패배
                            </div>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                        <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                            <Slime direction="down"  fill="FIRE" width="5vw" height="5vh" isAbsolute={false}></Slime>
                            <div style={{ textAlign: "center" }}>
                                <strong>속성 - 불</strong>
                                <p></p>
                                <strong>풀속성</strong> 슬라임과 전투시 승리
                                <p></p>
                                <strong>물속성</strong> 슬라임과 전투시 패배
                            </div>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                        <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                            <Slime direction="down" fill="WATER" width="5vw" height="5vh" isAbsolute={false}></Slime>
                            <div style={{ textAlign: "center" }}>
                                <strong>속성 - 물</strong>
                                <p></p>
                                <strong>물속성</strong> 슬라임과 전투시 승리
                                <p></p>
                                <strong>풀속성</strong> 슬라임과 전투시 패배
                            </div>
                        </div>
                    </Carousel.Item>
                </Carousel>

                <InputGroup className="mb-3">
                    <Form.Control
                        required
                        placeholder="닉네임을 입력해주세요."
                        aria-label="닉네임"
                        aria-describedby="basic-addon2"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    <Button style={{ backgroundColor: btnColor }} onClick={btnHanlder} variant="outline-secondary">
                        전생
                    </Button>
                </InputGroup>
            </ModalBody>
        </Modal>
    )
}