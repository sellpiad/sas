import { Client } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CubeSet from "../Cube/CubeSet.tsx";
import SlimeField from "../Cube/SlimeField.tsx";
import { persistor } from "../index.js";
import { updateObserve, updateScale } from "../redux/gameSlice.tsx";
import { RootState } from "../redux/store.tsx";
import { updateSize } from "../redux/cubeSlice.tsx";


/**
 * Component PlayBody
 * 게임이 표시되는 핵심 컴포넌트.
 * 
 * Children Component
 * -CubeSet: 큐브 집합 
 * -SlimeField: 슬라임들의 집합
 */

interface Props {
    client: Client | undefined
}

export default function PlayBody({ client }: Props) {

    // 게임 스케일 및 게임 시점용 state
    const scale = useSelector((state: RootState) => state.game.scale)
    const observeX = useSelector((state: RootState) => state.game.observeX)
    const observeY = useSelector((state: RootState) => state.game.observeY)

    // 현재 유저 위치
    const playerPos = useSelector((state: RootState) => state.user.position)

    // 현재 게임 사이즈
    const gameSize = useSelector((state: RootState) => state.game.size)

    // 나타낼 큐브 좌표 (left,top)~(right,down)
    const [left, setLeft] = useState<number>(0)
    const [top, setTop] = useState<number>(0)
    const [right, setRight] = useState<number>(0)
    const [down, setDown] = useState<number>(0)

    const [limitXY, setLimitXY] = useState<number>(0) // 옵저버 이동 한계 좌표

    const [height, setHeight] = useState<number>(0) // 해당 컴포넌트 높이

    const dispatch = useDispatch() // redux state 수정용


    const disconnect = () => {
        client?.deactivate()
        persistor.purge()
    }


    const handleBeforeUnload = () => {
        console.log("exit!");
        disconnect();
    }

    const getWidth = () => {
        const width = document.getElementById('observer-window')?.offsetWidth;

        if (width != null) {
            setHeight(width)
        }
    }

    const getCoordinate = () => {

        const cubeNumber = Number(playerPos.substring(8))

        const x = cubeNumber % gameSize;
        const y = Math.floor(cubeNumber / gameSize)

        dispatch(updateObserve({ observeX: x, observeY: y }))
    }

    const setObserveCenter = () => {

        const box = document.getElementById(playerPos)

        if (box) {
            const boxHeight = box.offsetHeight
            const boxWidth = box.offsetWidth
            const boxLeft = box.offsetLeft
            const boxTop = box.offsetTop

            const x = height / 2 - (boxLeft + ((boxWidth) / 2))
            const y = height / 2 - (boxTop + ((boxHeight) / 2))

            dispatch(updateObserve({ observeX: Math.abs(x) < limitXY ? x : Math.sign(x) * limitXY, observeY: Math.abs(y) < limitXY ? y : Math.sign(y) * limitXY }))

        }

    }


    const wheelHandler = (e: React.WheelEvent<HTMLDivElement>) => {

        if (e.deltaY < 0) {
            dispatch(updateScale({ scale: ((scale + 0.1 > 10) ? scale : scale + 0.1) }))
        } else {
            dispatch(updateScale({ scale: ((scale - 0.1 < 1) ? scale : scale - 0.1) }))
        }

    }

    // 시점 및 스케일 업데이트에 의한 큐브 표시 범위 업데이트 
    useEffect(() => {

        setLeft(observeX - (scale + 3) >= 0 ? observeX - (scale + 3) : left)
        setTop(observeY - (scale + 3) >= 0 ? observeY - (scale + 3) : top)
        setRight(observeX + (scale + 3) >= 0 ? observeX + (scale + 3) : right)
        setDown(observeY + (scale + 3) >= 0 ? observeY + (scale + 3) : down)

        setLimitXY((((scale * height) - height) / 2) / scale)

    }, [scale, observeX, observeY])



    useEffect(() => {

        getWidth()

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('resize', getWidth)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('resize', getWidth)
        }


    }, [])

    useEffect(() => {
        
        setObserveCenter()

        if(playerPos.length > 1)
            dispatch(updateScale({scale:3}))

    }, [scale, playerPos, limitXY])



    return (
        <div id="observer-window" style={{ overflow: "hidden", width: "100%", height: height }}>
            <Row id="field-parent" style={{ width: "100%", height: height, position: "relative", transform: `scale(${scale}) translate(${observeX}px, ${observeY}px)`, transition: 'transform 0.5s ease' }} onWheel={wheelHandler}>
                <CubeSet client={client} left={left} top={top} right={right} down={down}></CubeSet>
                <SlimeField client={client} left={left} top={top} right={right} down={down}></SlimeField>
            </Row>
        </div>
    )
}

