import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Slime from "../slime/Slime.tsx";
import { Client, IMessage } from "@stomp/stompjs";
import './ObserverControl.css'
import { useDispatch } from "react-redux";
import { updatePlayerId } from "../redux/UserSlice.tsx";


/**
 * Component ObserverControl
 * 관전 기능 구현 컴포넌트
 * 
 * Children Component
 * -Slime
 */


interface Props {
    client: Client | undefined
}

interface ObservedPlayer {
    username: string
    attr: string
    kill: number
    conquer: number
    playerId: string
}

export default function ObserverControl({ client }: Props) {

    const [nickname, setNickname] = useState<string>('')
    const [attr, setAttr] = useState<string>('')
    const [kill, setKill] = useState<number>(0)
    const [conquer, setConquer] = useState<number>(0)

    const [list, setList] = useState<ObservedPlayer[]>([])

    const dispatch = useDispatch()

    useEffect(() => {
        if (client) {
            client.subscribe('/topic/player/playerList', (msg: IMessage) => {

                const parser = JSON.parse(msg.body)

                const list: ObservedPlayer[] = Object.values(parser) as ObservedPlayer[]

                setList(list)
            })

            client.publish({ destination: '/app/player/playerList' })
        }
    }, [client])

    useEffect(() => {

        if (list.length > 0) {
            setNickname(list[0].username)
            setAttr(list[0].attr)
            setKill(list[0].kill)
            setConquer(list[0].conquer)
            dispatch(updatePlayerId({playerId:list[0].playerId}))
        }

    }, [list])

    return (
        <Row className="observer">
            <Col xs={2} sm={3}>
                <Slime playerId={"ObserverSlime"} direction={"down"} width={"100%"} height={"100%"} isAbsolute={false} fill={attr}></Slime>
            </Col>
            <Col xs={3} sm={9} className="msg-nickname">
                <strong>{nickname}</strong> <span>의 플레이를 관전 중</span>
            </Col>
            <Col xs={2} sm={12} className="info-container">
                <span className="box-attr">속성</span>
                <span className="box-attr">{attr}</span>
            </Col>
            <Col xs={1} sm={12} className="info-container">
                <span className="box-attr">킬</span>
                <span className="box-attr">{kill}</span>
            </Col>
            <Col xs={3} sm={12} className="info-container">
                <span className="box-attr">정복횟수</span>
                <span className="box-attr">{conquer}</span>
            </Col>
        </Row>
    )
}