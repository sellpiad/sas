//접속기록
//유저정보 조회, 추가, 삭제
//현재 플레이 중인 유저 및 AI

import { Client } from "@stomp/stompjs";
import React, { useState } from "react";
import { Button, Col, Modal, ModalBody, Row } from "react-bootstrap";
import UserPanel from "./UserPanel.tsx";
import LogPanel from "./LogPanel.tsx";
import GamePanel from "./GamePanel.tsx";
import './Admin.css'

interface Props {
    client: Client | undefined
    show: boolean
    onHide: () => void
}

export default function Admin({ client, show, onHide }: Props) {

    const [mode, setMode] = useState<string>('USER')

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <ModalBody className="Admin">
                <div className='menu-bar'>
                    <Button variant="outline-success" onClick={() => setMode('USER')}>유저 관리</Button>
                    <Button variant="outline-success" onClick={() => setMode('LOG')}>로그 현황</Button>
                    <Button variant="outline-success" onClick={() => setMode('GAME')}>게임 관리</Button>
                </div>
                <div className='control-panel'>
                    {mode === 'USER' && <UserPanel />}
                    {mode === 'LOG' && <LogPanel />}
                    {mode === 'GAME' && <GamePanel client={client}/>}
                </div>
            </ModalBody>
        </Modal>
    )
}