import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";

interface Props {
    client: Client | undefined
}

export default function Chat({ client }: Props) {

    const [chat,setChat] = useState<Array<string>>(new Array())
    const basement = useRef<HTMLDivElement | null>(null)

 
    useEffect(() => {
        
        client?.subscribe('/topic/game/chat', (msg:IMessage) => {

            setChat(chat => [...chat,msg.body])
        })

    }, [])

    useEffect(() => {
        
        basement.current?.scrollIntoView({behavior:"smooth"})

    },[chat])

    return (
        <Row>
            <Col xs={{ span: 10, offset: 1 }}  sm={{ span: 6, offset: 1}}>
                <div id="chat" style={
                    {
                        borderRadius: "0.3rem",
                        borderColor: "gray",
                        backgroundColor: "#343a40",
                        height: "20vh",
                        boxShadow: "0px 0px 6px 0px",
                        textAlign: "start",
                        padding: "0.3rem 0.75rem",
                        overflow: "scroll",
                        position: "relative"
                    }
                }>
                    {
                        chat.map((value,index,array) => {
                            return <p key={'chat' + index}>{value}</p>
                        })
                    }
                    <div ref={basement}></div>

                </div>
            </Col>
        </Row>
    )
}