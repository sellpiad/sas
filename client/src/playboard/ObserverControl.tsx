import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import Slime from "../slime/Slime";

export default function ObserverControl() {

    const [nickname, setNickname] = useState<string>('')
    const [att,setAttr] = useState<string>('')

    const [list,setList] = useState<string>('')


    return (
        <Row>
            <Col>
                <Slime isAbsolute={false}></Slime>
            </Col>
            <Col>
                <strong>{nickname}</strong> 의 플레이를 관전 중
            </Col>
        </Row>
    )
}