import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Modal, ModalBody } from "react-bootstrap";
import { useDispatch } from "react-redux";
import './RankingBoard.css';

interface Props {
    client: Client | undefined
    show: boolean
    onHide: () => void
}

export default function RankingBoard({ client, show, onHide }: Props) {

    const [list, setList] = useState([])

    const dispatch = useDispatch()

    useEffect(() => {

        if (client?.connected) {

            // 업데이트용
            client.subscribe('/topic/game/ranker', (msg: IMessage) => {
                const parser = JSON.parse(msg.body)
                setList(Array.from(parser))
            })

            // 초기 요청용
            client.subscribe('/user/queue/game/ranker', (msg: IMessage) => {
                const parser = JSON.parse(msg.body)
                setList(Array.from(parser))
            })

        }

    }, [client])


    useEffect(() => {

        if (client?.connected) {
            client.publish({ destination: '/app/game/ranker' });
        }

    }, [show])


    return (
        <Modal show={show} onHide={onHide} centered >
            <ModalBody style={{ height: "40vh", fontFamily: "DNFBitBitv2", fontSize: "0.9rem" }}>
                <div style={{ height: "15%" }}>
                    <strong>실시간 플레이어 랭킹</strong>
                    <div style={{ display: "flex", padding: "0 3px" }}>
                        <span className="rank-col">순위</span>
                        <span className="nickname-col">닉네임</span>
                        <span className="kill-col">킬</span>
                        <span className="attr-col">속성</span>
                    </div>
                </div>
                <div className="scroll-container">
                    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                        {
                            list.map((value, index, array) => {
                                return <li key={"ranker" + index} className={value['isMe'] ? 'myRank' : ''} style={{ display: "flex", justifyContent: "space-between", padding: "3px" }}>
                                    <span className="rank-col">{index + 1}</span>
                                    <span className="nickname-col">{value['nickname']}</span>
                                    <span className="kill-col">{value['kill']}</span>
                                    <span className="attr-col">{value['attr']}</span>
                                </li>
                            })
                        }
                    </ul>
                </div>
            </ModalBody>
        </Modal>

    )

}