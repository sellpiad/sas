
import { Client, IMessage } from "@stomp/stompjs"
import React, { useEffect } from "react"
import { Button, Col, Row, Stack } from "react-bootstrap"
import { useDispatch } from "react-redux"
import { changeLogin } from "../redux/userSlice.tsx"
import Slime from "../slime/Slime.tsx"
import './intro.css'
import RankingBoard from "./ranking/RankingBoard.tsx"


interface Props {
    client: Client
}

export default function Intro({ client }: Props) {

    const dispatch = useDispatch()

    const enterBtnHandler = () => {
        client.publish({ destination: "/app/user/newbie" })
    }

    useEffect(() => {

        client.subscribe("/user/queue/user/newbie", (msg: IMessage) => {
            dispatch(changeLogin({ isLogined: msg.body }))
        })

        return () => {
            client.unsubscribe("/user/queue/user/newbie")
        }

    }, [])



    return (
        <Row>
            <Col xs={{ span: 10, offset: 1 }} sm={{ span: 10, offset: 1 }}>
                <Stack gap={2}>
                    <Row>
                        <Col xs={{ span: 2, offset: 2 }} style={{ paddingRight: 0 }}>
                            <Slime move="down" width={"100%"} height={"100%"} isAbsolute={false}></Slime>
                        </Col>
                        <Col xs={{ span: 6 }} style={{ paddingLeft: 0 }}>
                            <svg width="100%" height="100%" viewBox="-5 -30 200 50">
                                <text
                                    x="0" y="0" fill="#3678ce"
                                    fontFamily="SBAggroB"
                                    fontSize="1.2rem"
                                    rotate="4, 8, -8, -4, -20, -24, 48, 0, 0">
                                    슬라임으로 살아남기
                                </text>
                            </svg>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={{ span: 10, offset: 1 }} sm={{ span: 8, offset:2}}>
                            <RankingBoard client={client}></RankingBoard>
                        </Col>
                    </Row>
                    <Row>
                        
                    </Row>
                </Stack>
            </Col>
        </Row>
    )
}