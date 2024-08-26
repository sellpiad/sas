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
    const [highestRanking, setHighestRanking] = useState<number>()
    const [killMax, setKillMax] = useState<number>()
    const [conquerMax, setConquerMax] = useState<number>()
    const [mainAttr, setMainAttr] = useState<string>()

    const [log, setLog] = useState([])

    useEffect(() => {

        if (show) {
            axios.get('/api/userInfo')
                .then((res) => {
                    setId(res.data.username)
                    setHighestRanking(res.data.highestRanking)
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
        <Modal show={show} onHide={onHide} centered >
            <ModalBody style={{ fontFamily: "DNFBitBitv2", fontSize: "0.9rem", height: "60vh" }}>

                <div className="playerinfo-title ">
                    <h3>{id}</h3>
                </div>
                <div className="playerinfo-content">
                    <div className="playerinfo-content-row">
                        <span className="playerlog-content-box">주속성</span>
                        <span className="playerlog-content-box">{mainAttr}</span>
                    </div>
                    <div className="playerinfo-content-row">
                        <span className="playerlog-content-box">최다킬</span>
                        <span className="playerlog-content-box">{killMax} 번</span>
                    </div>
                    <div className="playerinfo-content-row">
                        <span className="playerlog-content-box">최고랭킹</span>
                        <span className="playerlog-content-box">
                            {highestRanking === -1 ? "OUT OF RANK" : `${highestRanking} 위`}
                        </span>
                    </div>
                    <div className="playerinfo-content-row">
                        <span className="playerlog-content-box">최다정복</span>
                        <span className="playerlog-content-box">{conquerMax} 번</span>
                    </div>
                </div>
                <div className="playerinfo-log">
                    <hr />
                    <h6>PLAY LOG</h6>

                    <div className="playerlog-th">
                        <span className="playTime-col">날짜</span>
                        <span className="username-col">닉네임</span>
                        <span className="attr-col">속성</span>
                        <span className="totalKill-col">킬</span>
                    </div>

                    <div className="playlog-container">
                        {log.map((value, index, array) => {
                            return (
                                <li key={"playlog" + index} style={{ display: "flex", justifyContent: "space-between", padding: "3px" }}>
                                    <span className="playTime-col" style={{ fontSize: "0.5rem" }}>{value['playTime']}</span>
                                    <span className="username-col">{value['nickname']}</span>
                                    <span className="attr-col">{value['attr']}</span>
                                    <span className="totalKill-col">{value['totalKill']}</span>
                                </li>
                            )
                        })
                        }
                    </div>
                </div>

            </ModalBody>
        </Modal >
    )
}