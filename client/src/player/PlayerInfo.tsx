import axios from "axios";
import React, { useEffect, useState } from "react";
import { Container, Modal, ModalBody, Row } from "react-bootstrap";
import './PlayerInfo.css'

interface Props {
    show: boolean
    onHide: () => void
}

interface playlog {
    username: string,
    attr: string,
    playtime: string,
    totalKill: number
}

export default function PlayerInfo({ show, onHide }) {

    const [id, setId] = useState<string>('')
    const [killMax, setKillMax] = useState<number>()
    const [conquerMax, setConquerMax] = useState<number>();
    const [mainAttr, setMainAttr] = useState<string>()

    const [log, setLog] = useState([])

    useEffect(() => {

        if (show) {
            axios.get('/api/userInfo')
                .then((res) => {
                    setId(res.data.username)
                    setKillMax(res.data.killMax)
                    setConquerMax(res.data.conquerMax)
                    setMainAttr(res.data.mainAttr)
                }).catch((err) => {
                    console.error(err)
                })

            axios.get('/api/player/playlog')
                .then((res) => {

                    setLog(res.data)

                }).catch((err) => {
                    console.error(err)
                })

        }

    }, [show])

    return (
        <Modal show={show} onHide={onHide} centered style={{ fontFamily: "DNFBitBitv2", fontSize: "0.9rem" }}>
            <ModalBody>
                <Container>
                    <Row>
                        <h3>{id}</h3>
                    </Row>
                    <Row>
                        <p />
                        <span style={{ width: "20%" }}>주속성 </span> <span style={{ width: "20%", paddingRight: 0 }}>{mainAttr}</span>
                        <p />
                        <span style={{ width: "20%" }}>최다킬 </span> <span style={{ width: "20%", paddingRight: 0 }}>{killMax}</span>
                        <p />
                        <span style={{ width: "20%" }}>최다정복 </span> <span style={{ width: "20%", paddingRight: 0 }}>{conquerMax}</span>
                        <p />
                    </Row>
                    <Row>
                        <hr />
                        <h6>PLAY LOG</h6>

                        <div style={{ display: "flex", padding: "0 3px" }}>
                            <span className="playTime-col">날짜</span>
                            <span className="username-col">닉네임</span>
                            <span className="attr-col">속성</span>
                            <span className="totalKill-col">킬</span>
                        </div>

                        {log.map((value, index, array) => {
                            return (
                                <li key={"playlog" + index} style={{ display: "flex", justifyContent: "space-between", padding: "3px" }}>
                                    <span className="playTime-col" style={{fontSize:"0.5rem"}}>{value['playTime']}</span>
                                    <span className="username-col">{value['username']}</span>
                                    <span className="attr-col">{value['attr']}</span>
                                    <span className="totalKill-col">{value['totalKill']}</span>
                                </li>
                            )
                        })
                        }
                    </Row>
                </Container>
            </ModalBody>
        </Modal >
    )
}