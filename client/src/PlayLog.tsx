import React from "react";
import { Container, Modal, ModalBody, Row } from "react-bootstrap";

interface Props {
    show: boolean
    onHide: () => void
}

export default function PlayLog({show,onHide}) {
    return (
        <Modal show={show} onHide={onHide} centered style={{ fontFamily: "DNFBitBitv2", fontSize: "0.9rem" }}>
            <ModalBody>
                <Container>
                    <Row>
                        <h4>YOU DIED</h4>
                    </Row>
                    <Row>
                        {/*죽은 슬라임 모션*/}
                    </Row>
                    <Row>
                        <p>주속성</p>
                        <p>킬</p>
                        <p>정복</p>
                    </Row>
                </Container>
            </ModalBody>
        </Modal>

    )
}