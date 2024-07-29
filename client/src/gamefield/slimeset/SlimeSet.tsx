import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSlime, removeSlime, SlimeDTO } from "../../redux/GameSlice.tsx";
import { updateObserverPos } from "../../redux/ObserverSlice.tsx";
import { RootState } from "../../redux/Store.tsx";
import { updatePosition, updateUsername } from "../../redux/UserSlice.tsx";
import Slime from "./Slime.tsx";


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
    username: string
    target?: string // 위치
    direction: string
}


export default function SlimeSet({ client }: Props) {

    // 슬라임 저장용 state
    //const [slimes, setSlimes] = useState<Map<string, SlimeDTO>>(new Map())

    const slimeset: { [key: string]: SlimeDTO } = useSelector((state: RootState) => state.game.slimeset);

    // 움직임 관련 states
    const [move, setMove] = useState<ActionData>()

    // 플레이어 아이디(게임 참가시)
    const username = useSelector((state: RootState) => state.user.username);
    const observerId = useSelector((state: RootState) => state.observer.observerId);

    // redux state 수정용
    const dispatch = useDispatch()


    // client 구독 관리
    useEffect(() => {

        if (client) {

            // 슬라임 위치 업데이트
            client.subscribe("/topic/game/move", (msg: IMessage) => {

                const ActionData = JSON.parse(msg.body) as ActionData

                setMove(ActionData)

            })

            // 슬라임 추가
            client.subscribe('/topic/game/addSlime', (msg: IMessage) => {

                const parser: SlimeDTO = JSON.parse(msg.body)

                dispatch(addSlime({ username: parser.username, slimedto: parser }))

            })


            // 슬라임 삭제
            client.subscribe('/topic/game/deleteSlime', (msg: IMessage) => {

                const id = msg.body

                // 플레이어라면 플레이어 아이디 초기화
                if (id == username) {
                    dispatch(updateUsername({ username: '' }))
                }

                dispatch(removeSlime({ username: id }))
            })

        }

        return () => {
            client?.unsubscribe('/topic/game/move')
            client?.unsubscribe('/topic/game/addSlime')
            client?.unsubscribe('/topic/game/deleteSlime')
        }

    }, [client])


    // 새로운 움직임이 들어왔을 때
    useEffect(() => {

        if (move && slimeset) {

            if (username === move.username && move.target !== null) {
                dispatch(updatePosition({ position: move.target }))
            }

            if (observerId === move.username && move.target !== null) {
                dispatch(updateObserverPos({ observerPos: move.target }))
            }

            const slime = slimeset[move.username]

            if (slime) {

                const moveSlime: SlimeDTO = {
                    actionType: move.actionType,
                    target: move.target ?? slime.target,
                    username: move.username,
                    attr: slime.attr,
                    direction: move.direction
                }

                dispatch(addSlime({ username: move.username, slimedto: moveSlime }))
            }
        }
    }, [move])


    return (
        slimeset &&
        <div style={{ position: "absolute", padding: 0 }}>
            {
                Object.values(slimeset).map((value) => {
                    return <Slime key={value['username']}
                        playerId={value['username']}
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
