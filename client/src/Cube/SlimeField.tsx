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
    target: string // 위치
    attr: string
    direction: string
}

interface ActionData {
    actionType: string
    playerId: string
    target?: string // 위치
    direction: string
}


export default function SlimeField({ client, left, top, right, down }: Props) {

    const [slimes, setSlimes] = useState<Map<string, SlimeDTO>>(new Map())    // 슬라임 저장용 state

    const [move, setMove] = useState<ActionData>()  // 움직임 관련 states

    const playerId = useSelector((state: RootState) => state.user.playerId);    // 플레이어 아이디(게임 참가시)
    const slimeBoxRendered = useSelector((state: RootState) => state.cube.isRendered)   // 큐브 렌더링 확인용
    const gameSize = useSelector((state: RootState) => state.game.size) // 현재 게임 사이즈

    const dispatch = useDispatch()

    // 슬라임이 현재 시점 안에 있는지 체크
    const isWithinRange = (cubeName: string) => {

        const cubeNumber = Number(cubeName.substring(8))

        const x = cubeNumber % gameSize;
        const y = Math.floor(cubeNumber / gameSize)

        return x >= left && x <= right && y >= top && y <= down
    }


    useEffect(() => {

        if (client) {

            // 처음 접속 했을 때, 현재 게임에 참가 중인 슬라임들 요청
            client.publish({ destination: '/app/game/slimes' })

            // 초기 슬라임들 받아오기
            client.subscribe('/user/queue/game/slimes', (msg: IMessage) => {

                const json = JSON.parse(msg.body) as { [key: string]: SlimeDTO }

                const slimeSet: Map<string, SlimeDTO> = new Map(Object.entries(json))

                setSlimes(slimeSet)

                client.unsubscribe('/user/queue/game/slimes')
            })


            // 유저 아이디 
            client.subscribe("/user/queue/player/ingame", (msg: IMessage) => {
                dispatch(updatePlayerId({ playerId: JSON.parse(msg.body) }))
            })

            // 초기 위치
            client.subscribe("/user/queue/player/initialPosition", (msg: IMessage) => {
                dispatch(updatePosition({ position: msg.body }))
            })

            // 슬라임 위치 업데이트
            client.subscribe("/topic/game/move", (msg: IMessage) => {

                const ActionData = JSON.parse(msg.body) as ActionData

                setMove(ActionData)
                
            })

            client.subscribe("/topic/game/chat",(msg:IMessage) => {
                console.log(msg.body)
            })


            // 슬라임 추가
            client.subscribe('/topic/game/addSlime', (msg: IMessage) => {

                const parser: SlimeDTO = JSON.parse(msg.body)

                setSlimes(prevSlimes => {
                    const slimeSet = new Map(prevSlimes)

                    slimeSet.set(parser.playerId, parser)

                    return slimeSet
                })
            })


            // 슬라임 삭제
            client.subscribe("/topic/game/deleteSlime", (msg: IMessage) => {

                setSlimes(prevSlimes => {
                    const slimeSet = new Map(prevSlimes)

                    slimeSet.delete(JSON.parse(msg.body))

                    return slimeSet
                })



            })

        }

        return () => {
            client?.unsubscribe('/topic/game/move')
            client?.unsubscribe('/topic/game/slimes')
            client?.unsubscribe('/topic/game/chat')
            client?.unsubscribe("/user/queue/player/movable")
            client?.unsubscribe("/user/queue/player/ingame")

        }

    }, [client])




    // 새로운 움직임이 들어왔을 때
    useEffect(() => {

        if (move) {

            if (playerId == move.playerId && move.target != undefined) {
                dispatch(updatePosition({ position: move.target }))
            }

            setSlimes(prevSlimes => {
                const slime = prevSlimes.get(move.playerId)

                if (slime) {

                    const moveSlime: SlimeDTO = {
                        actionType: move.actionType,
                        target: move.target ?? slime.target,
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


    return (
        slimeBoxRendered &&
        <div style={{ position: "absolute", padding: 0 }}>

            {
                [...slimes.values()].map((value, index, array) => {
                    return <Slime key={value['playerId']}
                        playerId={value['playerId']}
                        actionType={value['actionType']}
                        direction={value['direction']}
                        fill={value['attr']}
                        target={value['target']}
                        isAbsolute={true}
                    />
                })
            }

        </div>
    )
}
