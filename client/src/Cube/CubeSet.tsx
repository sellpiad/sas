import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Col, Row, Stack } from "react-bootstrap";
import CubeObj from "./CubeObj.tsx";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store.tsx";
import Slime from "../slime/Slime.tsx";
import { cube, updateRenderingState, updateSize } from "../redux/cubeSlice.tsx";
import { updateIsDominating, updatePlayerId } from "../redux/userSlice.tsx";
import { boxResize, changeGameSize } from "../redux/gameSlice.tsx";
import { Root } from "react-dom/client";

interface Props {
    client: Client | undefined;
    left: number
    top: number
    right: number
    down: number
}

export default function CubeSet({ client, left, top, right, down }: Props) {

    const [conqueredCubes, setConqueredCubes] = useState<Set<string>>(new Set<string>())
    const [clickable, setClickable] = useState<Set<string>>(new Set<string>())

    const [cubeSet, setCubeSet] = useState(new Array)

    const [targetCube, setTartgetCube] = useState<string>('')


    const dispatch = useDispatch()
    const playerId = useSelector((state: RootState) => state.user.playerId)
    const width = useSelector((state: RootState) => state.game.width)
    const size = useSelector((state: RootState) => state.game.size)
    
    const playerPos = useSelector((state: RootState) => state.user.position)


    const isConquered = (cubeNickname: string) => {
        return conqueredCubes.has(cubeNickname)
    }

    const isClickable = (cubeNickname: string) => {
        return playerPos === cubeNickname ? true : false
    }

    const isDominating = (cubeNickname: string) => {
        return targetCube === cubeNickname ? true : false
    }


    useEffect(() => {

        if (client != undefined) {
            client.subscribe('/user/queue/cube/cubeSet', (msg: IMessage) => {

                const parser = JSON.parse(msg.body)

                setCubeSet(parser.reduce((result, value) => {

                    const posY = value['posY']

                    if (!result[posY])
                        result[posY] = [];

                    result[posY].push(value)
                    return result
                }, {}))


            })

            client.subscribe('/user/queue/player/alive', (msg: IMessage) => {
                if (!JSON.parse(msg.body)) {
                    dispatch(updatePlayerId({ playerId: null }))
                }
            })

            client.subscribe("/user/queue/player/isDominating", (msg: IMessage) => {
                setTartgetCube(msg.body)
            })

            client.subscribe("/user/queue/cube/conqueredCubes", (msg: IMessage) => {
                //setConqueredCubes(new Set<string>(JSON.parse(msg.body)))
            })

            client.subscribe("/user/queue/cube/clickable", (msg: IMessage) => {
                setClickable(JSON.parse(msg.body) ? new Set<string>(JSON.parse(msg.body)) : new Set<string>())
            })


            client.publish({ destination: '/app/cube/cubeSet' })
        }


        return () => {

            if (client != undefined) {
                client.unsubscribe("/user/queue/cube/cubeSet")
                client.unsubscribe("/user/queue/cube/conqueredCubes")
                client.unsubscribe("/user/queue/cube/clickable")
            }

        }

    }, [])


    useEffect(() => {

        if (cubeSet[0] != undefined) {

            const lengths = Object.values(cubeSet).map((value) => value.length)

            dispatch(updateRenderingState({ isRendered: true }))
            dispatch(changeGameSize({ size: Math.max(...lengths) }))
        }

    }, [cubeSet])

    useEffect(() => {

        if (playerId === null) {
            setConqueredCubes(new Set<string>())
            setClickable(new Set<string>())
        }

    }, [playerId])


    useEffect(() => {

        dispatch(boxResize({ boxSize: width / size }))

    }, [width, size])





    return (

        <Stack gap={2} id="cubeSet">

            {
                Object.keys(cubeSet).map((rowNum, index) => {
                    return top <= Number(rowNum) && down >= Number(rowNum) && (
                        <div key={'row-' + rowNum} style={{ display: "flex", flexFlow: "row", gap: "0.5rem", flex: "1"}}>
                            {
                                cubeSet[rowNum].map((cube, index) => {
                                    return left <= Number(cube.posX) && right >= Number(cube.posX) &&
                                        <div key={'col-' + cube.posX + cube.posY} style={{width:"100%", height:"100%"}}>
                                            <CubeObj name={cube.name} isConquest={isConquered(cube.name)} isClickable={isClickable(cube.name)} isDominating={isDominating(cube.name)} />
                                        </div>

                                })

                            }
                        </div>)
                })

            }
        </Stack>

    )

}