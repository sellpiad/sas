import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Slime from "../gamefield/slimeset/Slime.tsx";
import { incKill, ObserverType, updateKill, updateObserver, updateObserverPos, updateRanking } from "../redux/ObserverSlice.tsx";
import { RootState } from "../redux/Store.tsx";
import { updateUsername } from "../redux/UserSlice.tsx";
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

interface IngameData {
    username: string
    position: string
}

export default function ObserverControl({ client }: Props) {


    // 옵저버 아이디 및 객체
    const observer = useSelector((state: RootState) => state.observer.observer)

    // 플레이어 아이디
    const username = useSelector((state: RootState) => state.user.username)

    const slimeset = useSelector((state: RootState) => state.game.slimeset)

    const isReady = useSelector((state: RootState) => state.game.isReady)

    const dispatch = useDispatch()

    useEffect(() => {

        if (client && isReady) {

            // 유저 아이디 
            client.subscribe("/user/queue/player/ingame", (msg: IMessage) => {

                const parser = JSON.parse(msg.body) as IngameData

                dispatch(updateUsername({ username: parser.username })) // 유저 이름 셋팅
                dispatch(updateObserverPos({ observerPos: parser.position })) // 초기 옵저버 위치 셋팅
            })

            // 옵저버 대상 정보 받아오기
            client.subscribe('/topic/player/anyObserver', (msg: IMessage) => {

                const parser = JSON.parse(msg.body) as ObserverType

                dispatch(updateObserver({ observer: parser })) // 옵저버 정보 셋팅
                dispatch(updateObserverPos({ observerPos: parser.position })) // 초기 옵저버 위치 셋팅

            })

            client.subscribe('/queue/player/findObserver', (msg: IMessage) => {

                const parser = JSON.parse(msg.body) as ObserverType

                dispatch(updateObserver({ observer: parser })) // 옵저버 정보 셋팅

            })

            client.subscribe('/user/queue/game/incKill', (msg: IMessage) => {

                dispatch(updateKill({kill: parseInt(msg.body)}))

            })

            client.subscribe('/user/queue/game/newRanking', (msg: IMessage) => {

                dispatch(updateRanking({ranking: parseInt(msg.body)}))

            })

            //처음 접속, 새로고침 시 플레이어가 존재하는지 검사하고, 아니라면 옵저버 요청.
            if (username === null) {
                client?.publish({ destination: '/app/player/anyObserver' })
            }
        }

    }, [isReady])


    // user 정보가 업데이트 됐을 때, user의 옵저버용 정보 요청.
    useEffect(() => {
        if (username) {
            client?.publish({ destination: '/app/player/findObserver', body: username })
        }
    }, [username])


    return (
        <Row className="observer">
            <Col xs={2} sm={3}>
                <Slime playerId={"ObserverSlime"} direction={"down"} width={"100%"} height={"100%"} isAbsolute={false} fill={observer?.attr}></Slime>
            </Col>
            <Col xs={3} sm={9} className="msg-nickname">
                <strong>{observer?.nickname}</strong> <span>의 플레이를 관전 중</span>
            </Col>
            <Col xs={2} sm={12} className="info-container">
                <span className="box-attr">속성</span>
                <span className="box-attr">{observer?.attr}</span>
            </Col>
            <Col xs={1} sm={12} className="info-container">
                <span className="box-attr">킬</span>
                <span className="box-attr">{observer?.kill}</span>
            </Col>
            <Col xs={3} sm={12} className="info-container">
                <span className="box-attr">정복횟수</span>
                <span className="box-attr">{observer?.conquer}</span>
            </Col>
        </Row>
    )
}