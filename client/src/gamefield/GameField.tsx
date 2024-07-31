import { Client } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { updateObserverCoor, updateScale } from '../redux/ObserverSlice.tsx';
import { RootState } from "../redux/Store.tsx";
import CubeSet from "./cubeset/CubeSet.tsx";
import './GameField.css';
import SlimeSet from "./slimeset/SlimeSet.tsx";


/**
 * Component PlayBody
 * 게임이 표시되는 핵심 컴포넌트.
 * 
 * -옵저버 기능
 * -게임판 크기 조절 기능
 * 
 * Children Component
 * -CubeSet: 큐브 집합 
 * -SlimeSet: 슬라임들의 집합
 */

interface Props {
    client: Client | undefined
}

export default function PlayBoard({ client }: Props) {

    // 게임 스케일 state
    const scale = useSelector((state: RootState) => state.observer.scale)

    // 해당 컴포넌트 높이
    const [height, setHeight] = useState<number>(0)

    // 옵저버 states
    const observeX = useSelector((state: RootState) => state.observer.observeX)
    const observeY = useSelector((state: RootState) => state.observer.observeY)
    const observerPos = useSelector((state: RootState) => state.observer.observerPos)

    // 옵저버 이동 한계 좌표
    const [limitXY, setLimitXY] = useState<number>(0)

    // redux state 수정용
    const dispatch = useDispatch()

    // 옵저버용 화면 크기 구하기
    const getWidth = () => {
        const width = document.getElementById('observer-window')?.offsetWidth;

        if (width != null) {
            setHeight(width)
        }
    }

    // 옵저버 위치를 좌표를 중심으로 조정
    const setObserveCenter = (position:string) => {

        const box = document.getElementById(position)

        if (box) {
            const boxHeight = box.offsetHeight
            const boxWidth = box.offsetWidth
            const boxLeft = box.offsetLeft
            const boxTop = box.offsetTop

            const x = height / 2 - (boxLeft + ((boxWidth) / 2))
            const y = height / 2 - (boxTop + ((boxHeight) / 2))

            dispatch(updateObserverCoor({ observeX: Math.abs(x) < limitXY ? x : Math.sign(x) * limitXY, observeY: Math.abs(y) < limitXY ? y : Math.sign(y) * limitXY }))
        }

    }

    // 초기화 
    useEffect(() => {

        getWidth() // 초기 화면 크기 구하기
        dispatch(updateScale({ scale: 2.5 })) // 초기 스케일 3으로 고정

        window.addEventListener('resize', getWidth)

        return () => {
            window.removeEventListener('resize', getWidth)
        }


    }, [])

    // 시점 및 스케일 업데이트에 의한 큐브 표시 범위 업데이트 
    useEffect(() => {

        setLimitXY((((scale * height) - height) / 2) / scale)

    }, [scale,height])


    // 옵저버 포지션이 변할 때 화면 중심 이동
    useEffect(() => {

        if(observerPos !== null)
            setObserveCenter(observerPos)

    }, [observerPos,limitXY])


    return (
        <div id="observer-window" className="observer-window">
            <Row id="field-parent" className="field-parent" style={{ height: height, transform: `scale(${scale}) translate(${observeX}px, ${observeY}px)`, transition: 'transform 0.5s ease' }}>
                <CubeSet client={client}></CubeSet>
                <SlimeSet client={client}></SlimeSet>
            </Row>
        </div>
    )
}

