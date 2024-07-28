import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCubeNickname } from "../../redux/CubeSlice.tsx";
import { addSlime, removeSlime, SlimeDTO } from "../../redux/GameSlice.tsx";
import { RootState } from "../../redux/Store.tsx";
import { updatePlayerId, updatePosition } from "../../redux/UserSlice.tsx";
import Slime from "./Slime.tsx";
import { updateObserverPos } from "../../redux/ObserverSlice.tsx";


/**
 * Component SlimeSet
 * 슬라임 컴포넌트 집합
 * 
 * 슬라임들의 모든 관련 데이터를 송수신
 * 
 */

interface Props {
    client: Client | undefined
}


interface ActionData {
    actionType: string
    playerId: string
    target?: string // 위치
    direction: string
}


export default function SlimeSet({ client }: Props) {

    // 슬라임 저장용 state
    //const [slimes, setSlimes] = useState<Map<string, SlimeDTO>>(new Map())

    const slimeset:{[key:string]:SlimeDTO} = useSelector((state: RootState) => state.game.slimeset);

    // 움직임 관련 states
    const [move, setMove] = useState<ActionData>()

    // 플레이어 아이디(게임 참가시)
    const playerId = useSelector((state: RootState) => state.user.playerId);
    const observerId = useSelector((state: RootState) => state.observer.observerId);

    // redux state 수정용
    const dispatch = useDispatch()


    // client 구독 관리
    useEffect(() => {

        if (client) {


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

            client.subscribe("/topic/game/chat", (msg: IMessage) => {
            })


            // 슬라임 추가
            client.subscribe('/topic/game/addSlime', (msg: IMessage) => {

                const parser: SlimeDTO = JSON.parse(msg.body)

                dispatch(addSlime({ playerId: parser.playerId, slimedto: parser }))

            })


            // 슬라임 삭제
            client.subscribe("/topic/game/deleteSlime", (msg: IMessage) => {

                const id = JSON.parse(msg.body)

                // 플레이어라면 플레이어 아이디 초기화
                if (id == playerId) {
                    dispatch(updatePlayerId({ playerId: '' }))
                }

                dispatch(removeSlime({ playerId: id }))
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

        if (move && slimeset) {

            if (playerId === move.playerId && move.target !== null) {
                dispatch(updatePosition({ position: move.target }))
            }

            if (observerId === move.playerId && move.target !== null) {
                dispatch(updateObserverPos({ observerPos: move.target }))
            }

            const slime = slimeset[move.playerId]

            if (slime) {

                const moveSlime: SlimeDTO = {
                    actionType: move.actionType,
                    target: move.target ?? slime.target,
                    playerId: move.playerId,
                    attr: slime.attr,
                    direction: move.direction
                }

                dispatch(addSlime({ playerId: move.playerId, slimedto: moveSlime }))
            }
        }
    }, [move])


    // 옵저버 아이디 업데이트 시, 현재 위치 찾아서 업데이트.
    useEffect(() => {

     
            

    }, [observerId])


    return (
        slimeset &&
        <div style={{ position: "absolute", padding: 0 }}>
            {
                Object.values(slimeset).map((value) => {
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
