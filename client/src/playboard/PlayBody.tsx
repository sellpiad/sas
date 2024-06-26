import { Client } from "@stomp/stompjs";
import React, { BaseSyntheticEvent, SyntheticEvent, WheelEventHandler, useEffect, useState } from "react";
import { Col, Row, Stack } from "react-bootstrap";
import CubeSet from "../Cube/CubeSet.tsx";
import SlimeField from "../Cube/SlimeField.tsx";
import { persistor } from "../index.js";

interface Props {
    client: Client | undefined
}

export default function PlayBody({ client }: Props) {

    const [scale,setScale] = useState<number>(1)
    const [posX,setPosX] = useState<number>(0)
    const [posY,setPosY] = useState<number>(0)


    const disconnect = () => {
        client?.deactivate()
        persistor.purge()
    }


    const handleBeforeUnload = () => {
        console.log("exit!");
        disconnect();
    }

    const wheelHandler = (e:React.WheelEvent<HTMLDivElement>) => {


        setPosX(e.clientX )
        setPosY(e.clientY)

        if(e.deltaY < 0){
            setScale(scale => scale + 0.1 > 2 ? scale : scale + 0.1)
        } else{
            setScale(scale => scale - 0.1 < 0.1 ? scale : scale - 0.1)
        }
    }


    useEffect(() => {

        window.addEventListener('beforeunload', handleBeforeUnload)




        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)

        }


    }, [])


    return (
        <Row id="field-parent" style={{ position: "relative", transformOrigin:"0 0", transform:"scale(" + scale + ")" }} onWheel={wheelHandler}>
            <CubeSet client={client}></CubeSet>
            <SlimeField client={client}></SlimeField>
        </Row>
    )
}

