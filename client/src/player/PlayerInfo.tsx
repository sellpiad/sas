import React, { useState } from "react";
import { Container, Modal, ModalBody, Row } from "react-bootstrap";

interface Props {
    show: boolean
    onHide: () => void
}

export default function PlayerInfo({show,onHide}) {

    const [id, setId] = useState<string>('')

    const [log, setLog] = useState([])

    return (
        <Modal show={show} onHide={onHide} style={{ fontFamily: "DNFBitBitv2", fontSize: "0.9rem" }}>
            <ModalBody>
                <Container>
                    <Row>
                        <h6>{id}</h6>
                    </Row>
                    <Row>
                        <p>최다킬</p>
                        <p>최다정복</p>
                        <p>주속성</p>
                    </Row>
                    <Row>
                        <hr />
                        <h6>PLAY LOG</h6>

                        <div style={{ display: "flex", padding: "0 3px" }}>
                            <span className="rank-col">날짜</span>
                            <span className="nickname-col">닉네임</span>
                            <span className="attr-col">속성</span>
                            <span className="kill-col">킬</span>
                            <span className="kill-col">정복</span>
                        </div>
                    </Row>
                </Container>
            </ModalBody>
        </Modal>
    )
}