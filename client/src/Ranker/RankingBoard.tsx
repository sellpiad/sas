import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useRef, useState } from "react";
import { Col, ListGroup, ListGroupItem, Modal, ModalBody, Row } from "react-bootstrap";
import './RankingBoard.css'
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface Props {
    client: Client | undefined
    show: boolean
    onHide: () => void
}

export default function RankingBoard({ client, show, onHide }: Props) {

    const [list, setList] = useState([])

    const status = useSelector((state: RootState) => state.game.gameStatus)


    useEffect(() => {

        if (client) {
            client.subscribe('/topic/game/ranker', (msg: IMessage) => {

                const parser = JSON.parse(msg.body)
                setList(Array.from(parser))
            })

            client.publish({ destination: '/app/game/ranker' });

        }

    }, [])


    return (
        <Modal show={show} onHide={onHide} size="sm" centered>
            <ModalBody>
                <div style={{ height: "30%" }}>
                    <strong>실시간 플레이어 랭킹</strong>
                    <p>순위 닉네임 킬 속성</p>
                </div>
                <div style={{
                    overflow: "scroll",
                    position: "relative", height: "70%"
                }}>
                    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                        {
                            list.map((value, index, array) => {
                                return <li key={"ranker" + index} className={value['isMe'] ? 'myRank' : ''}>{(index + 1) + " " + value['nickname'] + " " + value['kill'] + " " + value['attr']}</li>
                            })
                        }
                    </ul>
                </div>
            </ModalBody>
        </Modal>

    )

}