import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import './ObserverInfo.css';
import useSlime from "../customHook/useSlime.tsx";
import slimePool from "../dataPool/slimePool.tsx";
import { SlimeSetType } from "../dataReceiver/gameReceiver.tsx";

interface Props {
    client: Client | undefined
}


/**
 * Component ObserverInfo
 * 
 * [설명] 옵저버 관련 정보 구현 컴포넌트 
 * 
 * [기능] RealtimeRanking 컴포넌트에서 선택된 옵저버 정보 참조
 * 
 * Children Component
 * 
 * -Slime(관전 대상 슬라임 표시용)
 */

export default function ObserverInfo({ client }: Props) {

    const [queue, setQueue] = useState<number>(0)
    const [slimeSet, dispatch] = useSlime()

    useEffect(() => {

        if (client?.connected) {
            client.subscribe('/topic/queue/total', (msg: IMessage) => {

                const parser = JSON.parse(msg.body)

                setQueue(parser)
            })

            // 슬라임 풀 데이터 추적 및 업데이트
            slimePool.subscribe((data: SlimeSetType) => {
                dispatch({ type: 'UPDATE_SLIME_SET', payload: data })
            })
        }

    }, [client?.connected])


    return (
        <Row className="observer">
            <Col xs={3} sm={6} md={7} lg={9} className="msg-nickname">
                <Row>
                    <span>[플레이어] {slimeSet.size} 명</span>
                </Row>
                <Row>
                    <span>[대기] {queue} 명</span>
                </Row>
                <Row>
                    <span>[보스] 투입 대기 중</span>
                </Row>
            </Col>
        </Row>
    )
}

