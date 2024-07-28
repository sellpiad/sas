import { Client } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Button, Carousel, Form, InputGroup, Modal, ModalBody } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { updateAttr } from "../redux/UserSlice.tsx";
import Slime from "../gamefield/slimeset/Slime.tsx";
import './CreateModal.css';

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

    const [nickname, setNickname] = useState<string>()

    const [slime, setSlime] = useState<number>(0)
    const [btnColor, setBtnColor] = useState<string>()
    const [btnText, setBtnText] = useState<string>()
    const [attr, setAttr] = useState<string>()

    const dispatch = useDispatch()

    const btnHanlder = () => {

        const state = { nickname: nickname, attr: attr }
        dispatch(updateAttr({ attr: attr }))
        client?.publish({ destination: '/app/queue/register', body: JSON.stringify(state) })
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
                            <Slime playerId="createModalGrass" direction="down" fill="GRASS" width="60%" height="60%" isAbsolute={false} target={undefined}></Slime>
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
                            <Slime playerId="createModalFire" direction="down" fill="FIRE" width="60%" height="60%" isAbsolute={false}></Slime>
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
                            <Slime playerId="createModalWater" direction="down" fill="WATER" width="60%" height="60%" isAbsolute={false}></Slime>
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

                <InputGroup className="mb-3" onSubmit={btnHanlder} hasValidation>
                    <Form.Control
                        required
                        placeholder="닉네임을 입력해주세요."
                        aria-label="닉네임"
                        aria-describedby="basic-addon2"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        isInvalid={true}
                    />
                    <Button style={{ backgroundColor: btnColor }} onClick={btnHanlder} variant="outline-secondary">
                        전생
                    </Button>
                    <Form.Control.Feedback type="invalid">
                        닉네임을 입력해주세요.
                    </Form.Control.Feedback>
                </InputGroup>
            </ModalBody>
        </Modal>
    )
}