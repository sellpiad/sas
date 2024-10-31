import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import useAction from "../customHook/useAction.tsx";
import useSlime from "../customHook/useSlime.tsx";
import slimePool from "../dataPool/slimePool.tsx";
import actionReceiver from "../dataReceiver/actionReceiver.tsx";
import { SlimeData, SlimeSetType } from "../dataReceiver/gameReceiver.tsx";
import playerReceiver, { Player, PlayerState } from "../dataReceiver/playerReceiver.tsx";
import { ActionData } from "../redux/GameSlice.tsx";
import { updateObserver, updateObserverData, updateScale } from '../redux/ObserverSlice.tsx';
import { RootState } from "../redux/Store.tsx";
import CubeSet from "./cubeset/CubeSet.tsx";
import EffectSet from "./effectset/EffectSet.tsx";
import './GameField.css';
import PlayerInfo from "./playerinfo/PlayerInfo.tsx";
import SlimeSet from "./slimeset/SlimeSet.tsx";


/**
 * Component PlayBody
 * 게임이 표시되는 핵심 컴포넌트.
 * 
 * -옵저버 기능 : 슬라임 박스 이름이 주어지면 그곳으로 이동.
 * 
 * -게임판 크기 조절 기능
 * 
 * Children Component
 * -CubeSet: 큐브 집합 
 * -SlimeSet: 슬라임들의 집합
 */

interface Props {
    client: Client | undefined
}

export default function GameField({ client }: Props) {

    // 게임 스케일 state
    const scale = useSelector((state: RootState) => state.observer.scale)

    const observer = useSelector((state: RootState) => state.observer.observer)
    const observerData = useSelector((state: RootState) => state.observer.data)

    // 해당 컴포넌트 크기
    const [width, setWidth] = useState<number>(0)
    const [height, setHeight] = useState<number>(0)


    // 옵저버 이동 한계 좌표
    const [limitX, setLimitX] = useState<number>(0)
    const [limitY, setLimitY] = useState<number>(0)

    const [focus, setFocus] = useState<boolean>(false)

    const [observerX, setObserverX] = useState<number>(0)
    const [observerY, setObserverY] = useState<number>(0)
    
    // redux state 수정용
    const reduxDispatch = useDispatch()

    // 옵저버용 화면 크기 구하기
    const getWindowSize = () => {
        const width = document.getElementById('observer-window')?.offsetWidth;
        const height = document.getElementById('observer-window')?.offsetHeight;
        const fullWidth = document.getElementById('root')?.offsetWidth

        if (width != undefined && height != undefined) {
            setWidth(width)
            setHeight(height)
        }

        if (fullWidth != undefined && fullWidth < 576) {
            reduxDispatch(updateScale({ scale: 3.5 }))
        } else if (fullWidth != undefined && fullWidth < 992) {
            reduxDispatch(updateScale({ scale: 2.5 }))
        } else {
            reduxDispatch(updateScale({ scale: 2.5 }))
        }

    }

    // 옵저버 위치를 좌표를 중심으로 조정
    const setObserveCenter = (position: string) => {

        const box = document.getElementById(position)

        if (box) {
            const boxHeight = box.offsetHeight
            const boxWidth = box.offsetWidth
            const boxLeft = box.offsetLeft
            const boxTop = box.offsetTop

            const x = width / 2 - (boxLeft + ((boxWidth) / 2))
            const y = width / 2 - (boxTop + ((boxHeight) / 2))

            setObserverX(Math.abs(x) < limitX ? x : Math.sign(x) * limitX)
            setObserverY(Math.abs(y) < limitY ? y : Math.sign(y) * limitY)

        }

    }

    // 초기화 
    useEffect(() => {

        getWindowSize() // 초기 화면 크기 구하기

        window.addEventListener('resize', getWindowSize)

        if (client?.connected) {
            client.subscribe('/topic/game/lockon', (msg: IMessage) => {

                if (observer === msg.body) {

                    setFocus(true)

                    setTimeout(() => {
                        setFocus(false)
                    }, 500)
                }

            })
        }

        return () => {
            window.removeEventListener('resize', getWindowSize)
        }


    }, [])

    // 시점 및 스케일 업데이트에 의한 큐브 표시 범위 업데이트 
    useEffect(() => {

        // observer window와 scale된 gamefield window와의 크기 차이
        // gamefield window는 정사각형을 유지해야하기 때문에 width=height
        const gapWidth = width - width * scale
        const gapHeight = height - width * scale

        // 0.5 = 두 윈도우 간의 크기 차이에서 1/2배를 해줘야 이동 한계 좌표가 나오기 때문.
        // 1/scale = scale이 적용된 element는 1px 이동시 (1*scale)px만큼 이동하므로 그를 보정
        setLimitX(Math.abs(gapWidth * 0.5 * (1 / scale)))
        setLimitY(Math.abs(gapHeight * 0.5 * (1 / scale)))


    }, [scale, width, height])


    // 옵저버 전환 시 초기 위치 업데이트
    useEffect(() => {

        if (observerData)
            setObserveCenter(observerData.position)

    }, [observerData])


    return (
        <div id="observer-window" className="observer-window">
            <Row id="gamefield-window" className="gamefield-window" style={{ width: width, height: width, transform: (focus ? 'scale(2)' : '') + `translate(${observerX}px, ${observerY}px)`, transition: 'transform 0.5s ease' }}>
                <CubeSet client={client} />
                <SlimeSet client={client} />
            </Row>
            <PlayerInfo client={client} />
        </div>
    )
}

