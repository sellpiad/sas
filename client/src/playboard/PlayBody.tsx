import { Client } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CubeSet from "../Cube/CubeSet.tsx";
import SlimeField from "../Cube/SlimeField.tsx";
import { persistor } from "../index.js";
import { updateScale } from "../redux/gameSlice.tsx";
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


    // 나타낼 큐브 좌표 (left,top)~(right,down)
    const [left, setLeft] = useState<number>(0)
    const [top, setTop] = useState<number>(0)
    const [right, setRight] = useState<number>(0)
    const [down, setDown] = useState<number>(0)

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
        const fieldParentWidth = document.getElementById('field-parent')?.offsetWidth;

        if (fieldParentWidth != null) {
            setHeight(fieldParentWidth)
        }
    }



    const wheelHandler = (e: React.WheelEvent<HTMLDivElement>) => {

        if (e.deltaY < 0) {
            dispatch(updateScale({ scale: ((scale + 1 > 3) ? scale : scale + 1) }))
        } else {
            dispatch(updateScale({ scale: ((scale - 1 < 0) ? scale : scale - 1) }))
        }

    }

    // 시점 및 스케일 업데이트에 의한 큐브 표시 범위 업데이트 
    useEffect(() => {

        setLeft(observeX - (scale + 3) >= 0 ? observeX - (scale + 3) : left)
        setTop(observeY - (scale + 3) >= 0 ? observeY - (scale + 3) : top)
        setRight(observeX + (scale + 3) >= 0 ? observeX + (scale + 3) : right)
        setDown(observeY + (scale + 3) >= 0 ? observeY + (scale + 3) : down)

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



    return (
        <Row id="field-parent" style={{ overflow: "hidden", width: "100%", height: height, position: "relative" }} onWheel={wheelHandler}>
            <CubeSet client={client} left={left} top={top} right={right} down={down}></CubeSet>
            <SlimeField client={client} left={left} top={top} right={right} down={down}></SlimeField>
        </Row>
    )
}

