import { Client } from "@stomp/stompjs";
import React, { useEffect, useRef, useState } from "react";
import { Row } from "react-bootstrap";
import useSlime from "../customHook/useSlime.tsx";
import slimePool from "../dataPool/slimePool.tsx";
import { SlimeSetType } from "../dataReceiver/gameReceiver.tsx";
import './RealtimeRanking.css';
import { useDispatch, useSelector } from "react-redux";
import { updateObserver, updateObserverData } from "../redux/ObserverSlice.tsx";
import playerReceiver, { Player, PlayerState } from "../dataReceiver/playerReceiver.tsx";
import { RootState } from "../redux/Store.tsx";
import { Prev } from "react-bootstrap/esm/PageItem";


interface PlayerCard {
    ranking: number
    attr: string
    nickname: string
    createdTime: number
    onClick: () => void
    selected: boolean
}

interface Props {
    client: Client | undefined
}

/**
 * Component RealtimeRanking
 * 
 * [목적] 실시간 랭킹 표시
 * [기능] 관찰 하고 싶은 랭커 선택, 실시간 랭킹 반영.
 * 
 * 옵저버 변경 케이스
 * 1. 초기화
 * 2. 플레이어 인게임
 * 3. 기존 옵저버 사망 
 * 4. 유저가 옵저버 지정
 */

export default function RealtimeRanking({ client }: Props) {

    const [slimeSet, dispatch] = useSlime()
    const [player, setPlayer] = useState<Player>()

    const observer = useRef<string>('')

    const reduxDispatch = useDispatch()

    const onClick = (username: string) => {

        if (slimeSet.has(username)) {
            observer.current = username
            reduxDispatch(updateObserver({ observer: observer.current}))
        }

    }

    const setTopRanker = () => {
        observer.current = slimeSet.keys().next().value
        reduxDispatch(updateObserver({ observer: observer.current}))
    }

    useEffect(() => {

        if (client?.connected) {


            // 슬라임 풀 데이터 추적 및 업데이트
            slimePool.subscribe((data: SlimeSetType) => {
                dispatch({ type: 'UPDATE_SLIME_SET', payload: data })
            })

            // 플레이어 데이터 추적 및 업데이트
            playerReceiver.subscribe((data: Player) => {
                setPlayer(data)
            })

        }

    }, [client?.connected])


    // 플레이어 게임 참가시 옵저버 업데이트.
    useEffect(() => {

        if (player && player.state == PlayerState.IN_GAME) {
            observer.current = player.username
            reduxDispatch(updateObserver({ observer: observer.current}))
        }

    }, [player])


   
    useEffect(() => {

        // 초기화 시 옵저버 설정
        if (slimeSet.size > 0 && observer.current === '') {
        }

         // 슬라임 셋에서 옵저버 데이터 추출.
         // 존재하지 않는다면 사망으로 간주, 새로운 옵저버 설정.
        if (slimeSet && slimeSet.has(observer.current)) {
            reduxDispatch(updateObserverData({ data: slimeSet.get(observer.current) }))
        } else {
            setTopRanker()
        }

    }, [slimeSet])



    return (
        <Row className="observerPanel d-none d-md-block" style={{ height: "60vh" }}>
            <Row className="observerPanel-title">
                <span>플레이어 실시간 현황</span>
            </Row>
            <Row id="observerPanel-body" className="observerPanel-body">
                {
                    Array.from(slimeSet.values()).map((value, index) => {

                        return (
                            <PlayerCard
                                key={'playercard-' + value.username}
                                ranking={index + 1}
                                attr={value.attr}
                                nickname={value.nickname}
                                createdTime={new Date(value.createdTime).getTime()}
                                onClick={() => onClick(value.username)}
                                selected={observer.current === value.username}
                            />
                        )
                    })

                }
                {slimeSet === undefined && Array.from({ length: 10 }, (_, index) => {
                    return <EmptyCard key={'emptycard-' + index + 1} />
                })
                }
            </Row>

        </Row>
    )
}

function PlayerCard({ ranking, attr, nickname, createdTime, onClick, selected }: PlayerCard) {

    const [survivalTime, setSurvivalTime] = useState<string>()


    const setTimer = (currentTime) => {

        const time = (Date.now() - createdTime) / 1000 // 초 변환

        setSurvivalTime(time.toFixed(0))

        requestAnimationFrame(setTimer)
    }

    useEffect(() => {

        const timer = requestAnimationFrame(setTimer)

        return () => cancelAnimationFrame(timer)

    }, [])


    return (
        <div className={`observerPanel-card player-card ${selected ? 'selected' : ''}`} onClick={onClick}>
            <span className="observerPanel-ranking-col">{ranking}</span>
            <span className="observerPanel-slime-col"></span>
            <span className="observerPanel-nickname-col">{nickname}</span>
            <span className="observerPanel-survivalTime-col">{survivalTime + "초"}</span>
        </div>
    )
}

function EmptyCard() {
    return (
        <div className="observerPanel-card">
            <span className="observerPanel-ranking-col skeleton" />
            <span className="observerPanel-slime-col skeleton" />
            <span className="observerPanel-nickname-col skeleton" />
            <span className="observerPanel-survivalTime-col skeleton" />
        </div>
    )
}

