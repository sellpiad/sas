import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import './ControlPanel.css'
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { RootState } from "../redux/Store";

/**
 * Component ControlPanel
 * 플레이어의 컨트롤을 전담하는 컴포넌트
 * 
 */

interface Props {
    client: Client | undefined
}

export default function ControlPanel({ client }: Props) {

    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']; //키보드로 들어올 키값
    const spaceKey = ['Space']

    const isLocked = useSelector((root:RootState) => root.user.isLocked)

    const directionRef = useRef<string>('down')
    const isPressingRef = useRef<boolean>(false)

    // 터치 및 클릭 버튼 이벤트 처리 메소드
    const handleClick = (button: string) => {
        directionRef.current = button
    };

    // 키보드 이벤트 처리 메소드
    const keyDown = (e: KeyboardEvent) => {

        if (arrowKeys.includes(e.code)) {
            directionRef.current = e.code.toLowerCase().substring(5)
            client?.publish({ destination: '/app/action', body: directionRef.current })
        } else if (spaceKey.includes(e.code) && !isPressingRef.current) {
            isPressingRef.current = true
            client?.publish({ destination: '/app/action/conquer/start', body: directionRef.current })
        }

    }

    const keyUp = (e: KeyboardEvent) => {
        if (spaceKey.includes(e.code)) {
            isPressingRef.current = false
            client?.publish({ destination: '/app/action/conquer/cancel', body: directionRef.current })
        }
    }

    useEffect(() => {

        window.addEventListener('keydown', keyDown)
        window.addEventListener('keyup', keyUp)

        return () => {
            window.removeEventListener('keydown', keyDown)
            window.removeEventListener('keyup', keyUp)
        }


    }, [])

    return (
        <Row className="d-xs-none d-md-none" xs={12}>
            <Col xs={3}>
                <svg onClick={() => handleClick('left')} className={directionRef.current === 'left' ? 'click-left-animation' : ''} width="100%" height="100%" viewBox="0 0 180 170" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M20 90H10L10 80H20L20 70H30V60H40V50H50L50 40H60V30H70V20H80L80 10H90L90 20V30V40V50H100L170 50L170 120L90 120V130V140V150V160H80V150H70V140H60V130H50V120H40V110H30L30 100H20V90ZM100 130L170 130H180V120L180 50V40H170L100 40V30V20L100 10V0H90H80H70V10H60V20H50V30H40V40H30V50H20L20 60H10L10 70H0L0 80L0 90L0 100H10V110H20V120H30V130H40V140H50L50 150H60V160H70V170H80H90H100V160V150V140V130Z" fill={directionRef.current === 'left' ? 'blue' : 'white'} />
                </svg>
            </Col>
            <Col xs={3}>
                <svg onClick={() => handleClick('up')} className={directionRef.current === 'up' ? 'click-up-animation' : ''} width="100%" height="100%" viewBox="0 0 170 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M80 20V10H90V20H100V30H110V40H120V50H130V60H140V70H150V80H160V90H150H140H130H120V100V170H50V90H40H30H20H10V80H20V70H30V60H40V50H50V40H60V30H70V20H80ZM40 100V170V180H50H120H130V170V100H140H150H160H170V90V80V70H160V60H150V50H140V40H130V30H120V20H110V10H100V0H90H80H70V10H60V20H50V30H40V40H30V50H20V60H10V70H0V80V90V100H10H20H30H40Z" fill={directionRef.current === 'up' ? 'blue' : 'white'} />
                </svg>
            </Col>
            <Col xs={3}>
                <svg onClick={() => handleClick('down')} className={directionRef.current === 'down' ? 'click-down-animation' : ''} width="100%" height="100%" viewBox="0 0 170 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M90 160V170H80V160H70V150H60V140H50V130H40V120H30V110H20V100H10V90H20H30H40H50V80V10L120 10L120 90H130H140H150H160V100H150V110H140V120H130V130H120V140H110V150H100V160H90ZM130 80L130 10V0H120L50 0H40V10L40 80H30H20H10H0V90V100V110H10V120H20V130L30 130V140H40V150H50V160H60V170H70V180H80H90H100V170H110V160H120V150H130V140H140V130H150V120H160V110H170V100V90V80H160H150H140H130Z" fill={directionRef.current === 'down' ? 'blue' : 'white'} />
                </svg>
            </Col>
            <Col xs={3}>
                <svg onClick={() => handleClick('right')} className={directionRef.current === 'right' ? 'click-right-animation' : ''} width="100%" height="100%" viewBox="0 0 180 170" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M160 80H170L170 90H160V100H150V110L140 110V120H130V130H120V140H110V150L100 150V160H90V150V140V130V120H80L10 120L10 50L90 50V40L90 30V20V10L100 10V20H110V30L120 30V40L130 40V50H140V60H150V70H160V80ZM80 40L10 40L0 40V50L0 120V130H10H80V140V150V160V170H90H100L110 170V160H120V150H130V140H140V130H150V120H160V110H170V100H180V90V80L180 70H170V60L160 60V50H150V40H140V30L130 30V20H120V10L110 10V0L100 0L90 0L80 0V10V20V30L80 40Z" fill={directionRef.current === 'right' ? 'blue' : 'white'} />
                </svg>
            </Col>
        </Row>
    )
}