import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store.tsx";
import { updatePlayerId, updatePosition } from "../redux/userSlice.tsx";
import Slime from "../slime/Slime.tsx";
import { updateCubeNickname } from "../redux/cubeSlice.tsx";

interface Props {
    client: Client | undefined
    left: number
    top: number
    right: number
    down: number
}

interface SlimeDTO {
    actionType: string
    playerId: string
    position: string
    attr: string
    direction: string
}

interface ActionData {
    actionType: string
    playerId: string
    target?: string
    direction: string
}


export default function SlimeField({ client }: Props) {

    const [slimes, setSlimes] = useState<Map<string, SlimeDTO>>(new Map())

    // 움직임 관련 states
    const [move, setMove] = useState<ActionData>()
    const [movable, setMovable] = useState<boolean>()

    const [direction, setDirection] = useState<string>()
    const [go, setGo] = useState<boolean>()

    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const playerId = useSelector((state: RootState) => state.user.playerId);

    const slimeBoxRendered = useSelector((state: RootState) => state.cube.isRendered)

    const dispatch = useDispatch()

    const keyDown = (e: KeyboardEvent) => {

        if (arrowKeys.includes(e.code)) {
            setDirection(e.code.toLowerCase().substring(5))
            setGo(true)
        } else if (e.code.match('Space')) {
            setGo(true)
        }
    }



    useEffect(() => {

        window.addEventListener('keydown', keyDown)

        if (client != undefined) {


            client.subscribe('/user/queue/game/slimes', (msg: IMessage) => {

                const json = JSON.parse(msg.body) as { [key: string]: SlimeDTO }

                const slimeSet: Map<string, SlimeDTO> = new Map(Object.entries(json))

                setSlimes(slimeSet)

                client.unsubscribe('/user/queue/game/slimes')
            })

            client.subscribe('/topic/game/addSlime', (msg: IMessage) => {

                const parser: SlimeDTO = JSON.parse(msg.body)

                setSlimes(prevSlimes => {
                    const slimeSet = new Map(prevSlimes)

                    slimeSet.set(parser.playerId, parser)

                    return slimeSet
                })
            })

            client.subscribe("/topic/game/chat", (msg: IMessage) => {

            })

            client.subscribe("/topic/game/deleteSlime", (msg: IMessage) => {

                setSlimes(prevSlimes => {
                    const slimeSet = new Map(prevSlimes)

                    slimeSet.delete(JSON.parse(msg.body))

                    return slimeSet
                })
                
                dispatch(updatePosition({position:''}))

            })


            client.subscribe("/topic/game/move", (msg: IMessage) => {

                const ActionData = JSON.parse(msg.body) as ActionData

                setMove(ActionData)

            })

            client.subscribe("/user/queue/player/ingame", (msg: IMessage) => {
                dispatch(updatePlayerId({ playerId: JSON.parse(msg.body) }))
            })

            client.subscribe("/user/queue/player/initialPosition", (msg: IMessage) => {
                dispatch(updatePosition({ position: msg.body }))
            })


            client.subscribe("/user/queue/player/movable", (msg: IMessage) => {
                setMovable(JSON.parse(msg.body))
            })

            client.subscribe("/user/queue/game/complete", (msg: IMessage) => {
                console.log("정복자! " + msg.body)
            })



            client.publish({ destination: '/app/game/slimes' })

        }



        return () => {
            client?.unsubscribe('/topic/game/move')
            client?.unsubscribe('/topic/game/slimes')
            client?.unsubscribe("/user/queue/player/movable")
            client?.unsubscribe("/user/queue/game/complete")
            client?.unsubscribe("/user/queue/player/ingame")
            window.removeEventListener('keydown', keyDown)
        }

    }, [])

    useEffect(() => {

        if (playerId) {
            //
        }

    }, [playerId])





    useEffect(() => {

        if (move) {

            if (playerId == move.playerId && move.target != null) {
                dispatch(updatePosition({ position: move.target }))
            }

            setSlimes(prevSlimes => {
                const slime = prevSlimes.get(move.playerId)

                if (slime) {

                    const moveSlime: SlimeDTO = {
                        actionType: move.actionType,
                        position: move.target ?? slime.position,
                        playerId: move.playerId,
                        attr: slime.attr,
                        direction: move.direction
                    }

                    if (move.target !== undefined)
                        dispatch(updateCubeNickname({ cubeNickname: move.target }))

                    const tempSlimes = new Map(prevSlimes)

                    tempSlimes.set(move.playerId, moveSlime)

                    return tempSlimes
                } else
                    return prevSlimes


            })
        }
    }, [move])


    useEffect(() => {

        /*if (direction && playerId != null) {

            const selected: ActionData = {
                playerId: JSON.parse(playerId),
                direction: direction
            }

            client?.publish({ destination: '/topic/game/move', body: JSON.stringify(selected) })
        }*/

    }, [direction])

    useEffect(() => {

        if (go) {
            client?.publish({ destination: '/app/game/move', body: direction })
            setGo(false)
        }
    }, [go])



    useEffect(() => {

        if (movable) {
            // 여기에 슬라임이 주위로 나갈 수 있도록 표시.
            console.log("움직일 수 있다!")
        }

    }, [movable])


    return (
        slimeBoxRendered &&
        <div style={{ position: "absolute", padding: 0 }}>

            {
                [...slimes.values()].map((value, index, array) => {
                    return <Slime key={value['playerId']}
                        playerId = {value['playerId']}
                        actionType={value['actionType']}
                        direction={value['direction']}
                        fill={value['attr']}
                        position={value['position']}
                        isAbsolute={true}
                    />
                })
            }

        </div>
    )
}
