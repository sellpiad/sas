import { Client } from "@stomp/stompjs";
import React, { BaseSyntheticEvent, SyntheticEvent, WheelEventHandler, useEffect, useState } from "react";
import { Col, Row, Stack } from "react-bootstrap";
import CubeSet from "../Cube/CubeSet.tsx";
import SlimeField from "../Cube/SlimeField.tsx";
import { persistor } from "../index.js";
import { useDispatch } from "react-redux";
import { updateScale } from "../redux/gameSlice.tsx";

interface Props {
    client: Client | undefined
}

export default function PlayBody({ client }: Props) {

    const [scale,setScale] = useState<number>(0)
    const [posX,setPosX] = useState<number>(3)
    const [posY,setPosY] = useState<number>(3)

    const [left,setLeft] = useState<number>(0)
    const [top,setTop] = useState<number>(0)
    const [right,setRight] = useState<number>(0)
    const [down,setDown] = useState<number>(0)

    const dispatch = useDispatch()


    const disconnect = () => {
        client?.deactivate()
        persistor.purge()
    }


    const handleBeforeUnload = () => {
        console.log("exit!");
        disconnect();
    }

    const wheelHandler = (e:React.WheelEvent<HTMLDivElement>) => {

        if(e.deltaY < 0){
            setScale(scale => scale + 1 > 3 ? scale : scale + 1)
        } else{
            setScale(scale => scale - 1 < 0 ? scale : scale -1 )
        }

    }

    useEffect(()=>{
 
        setLeft(posX - (scale + 2) >= 0 ? posX - (scale + 2) : left)
        setTop(posY - (scale + 2) >= 0 ? posY - (scale + 2) : top)
        setRight(posX + (scale + 2) >= 0 ? posX + (scale + 2) : right)
        setDown(posY + (scale + 2) >= 0 ? posY + (scale + 2) : down)
        dispatch(updateScale({scale:scale}))

    },[scale,posX,posY])


    useEffect(() => {

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)

        }


    }, [])


    return (
        <Row id="field-parent" style={{overflow:"hidden", width:"100%",height:"60vh", position:"relative"}} onWheel={wheelHandler}>
            <CubeSet client={client} left={left} top={top} right={right} down={down}></CubeSet>
            <SlimeField client={client} left={left} top={top} right={right} down={down}></SlimeField>
        </Row>
    )
}

