import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Slime from "../gamefield/slimeset/Slime.tsx";
import { updateObserverId, updateObserverPos } from "../redux/ObserverSlice.tsx";
import { RootState } from "../redux/Store.tsx";
import './ObserverInfo.css';


/**
 * Component ObserverInfo
 * 옵저버 관련 정보 구현 컴포넌트
 * 
 * Children Component
 * -Slime(관전 대상 슬라임 표시용)
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

    // 옵저버 정보
    const [observedPlayer, setObservedPlayer] = useState<ObservedPlayer>()

    // 옵저버 아이디
    const observerId = useSelector((state: RootState) => state.observer.observerId)

    // 플레이어 아이디
    const playerId = useSelector((state:RootState) => state.user.playerId)

    const slimeset = useSelector((state:RootState) => state.game.slimeset)

    const isReady = useSelector((state:RootState) => state.game.isReady)

    const dispatch = useDispatch()

    useEffect(() => {

        if (client && isReady) {

            // 옵저버 대상 정보 받아오기
            client.subscribe('/topic/player/anyObserver', (msg: IMessage) => {

                const parser = JSON.parse(msg.body)

                const observedPlayer: ObservedPlayer = parser as ObservedPlayer

                setObservedPlayer(observedPlayer)
            })

            // 슬라임 삭제가 발생했을 때 그것이 옵저버인지 아닌지 판별.
            client.subscribe("/topic/game/deleteSlime", (msg: IMessage) => {

                if (JSON.parse(msg.body) == observedPlayer?.playerId) {
                    client.publish({ destination: '/app/player/anyObserver' })
                }
            })

            // 현재 플레이 중이 아니라면 옵저버 받아오기
            if(playerId !== '')
                client.publish({ destination: '/app/player/anyObserver' })
        }

        return () => {

            if (client) {
                client.unsubscribe('/topic/player/anyObserver')
                client.unsubscribe('/topic/game/deleteSlime"')
            }

        }

    }, [isReady])


    // 플레이어 추가 됐을 때 옵저버 아이디도 업데이트
    useEffect(()=>{

        if(playerId !== '')
            dispatch(updateObserverId({observerId: playerId}))

    },[playerId])


    useEffect(() => {

        if (observedPlayer) {
            dispatch(updateObserverId({ observerId: observedPlayer.playerId }))
        }

    }, [observedPlayer])

    useEffect(()=>{

        if(observerId){
            if(slimeset[observerId]===undefined){
                client?.publish({ destination: '/app/player/anyObserver' })
            }else{
                dispatch(updateObserverPos({ observerPos: slimeset[observerId].target }))
            }
        }

    },[observerId])


    return (
        <Row className="observer">
            <Col xs={2} sm={3}>
                <Slime playerId={"ObserverSlime"} direction={"down"} width={"100%"} height={"100%"} isAbsolute={false} fill={observedPlayer?.attr}></Slime>
            </Col>
            <Col xs={3} sm={9} className="msg-nickname">
                <strong>{observedPlayer?.username}</strong> <span>의 플레이를 관전 중</span>
            </Col>
            <Col xs={2} sm={12} className="info-container">
                <span className="box-attr">속성</span>
                <span className="box-attr">{observedPlayer?.attr}</span>
            </Col>
            <Col xs={1} sm={12} className="info-container">
                <span className="box-attr">킬</span>
                <span className="box-attr">{observedPlayer?.kill}</span>
            </Col>
            <Col xs={3} sm={12} className="info-container">
                <span className="box-attr">정복횟수</span>
                <span className="box-attr">{observedPlayer?.conquer}</span>
            </Col>
        </Row>
    )
}