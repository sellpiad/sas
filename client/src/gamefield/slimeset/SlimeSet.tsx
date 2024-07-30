import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSlime, removeSlime, SlimeDTO } from "../../redux/GameSlice.tsx";
import { updateObserverPos } from "../../redux/ObserverSlice.tsx";
import { RootState } from "../../redux/Store.tsx";
import { updatePosition, updateUsername } from "../../redux/UserSlice.tsx";
import Slime from "./Slime.tsx";
import throttle from 'lodash'


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

    // 슬라임셋
    const slimeset: { [key: string]: SlimeDTO } = useSelector((state: RootState) => state.game.slimeset);
    const [slimes, setSlimes] = useState<{ [key: string]: SlimeDTO }>({})

    // 플레이어 아이디(게임 참가시)
    const username = useSelector((state: RootState) => state.user.username);
    const observerId = useSelector((state: RootState) => state.observer.observerId);

    // 큐 관련
    const msgQueue = useRef<ActionData[]>([])
    const processing = useRef<boolean>(false)
    const slimesetRef = useRef(slimeset);

    // redux state 수정용
    const dispatch = useDispatch()

    // ActionData 처리
    const processAction = async (action: ActionData) => {

        if (action && slimes) {

            if (username === action.username && action.target !== null) {
                dispatch(updatePosition({ position: action.target }))
            }

            if (observerId === action.username && action.target !== null) {
                dispatch(updateObserverPos({ observerPos: action.target }))
            }

            const slime = slimesetRef.current[action.username]

            if (slime) {

                const moveSlime: SlimeDTO = {
                    actionType: action.actionType,
                    target: action.target ?? slime.target,
                    username: action.username,
                    attr: slime.attr,
                    direction: action.direction
                }


                setSlimes(prev => ({
                    ...prev,
                    [moveSlime.username]: moveSlime
                }))
                //dispatch(addSlime({ username: action.username, slimedto: moveSlime }))
            }
        }
    }


    // 큐에서 순차적으로 ActionData를 추출
    const processQueue = async () => {

        if (processing.current) return;

        processing.current = true;

        console.log(msgQueue.current.length)

        while (msgQueue.current.length > 0) {
            const action = msgQueue.current.shift();
            if (action) {
                await processAction(action);
            }
        }

        processing.current = false;
    }



    // slimeset이 변경될 때마다 slimesetRef를 업데이트
    useEffect(() => {

        slimesetRef.current = slimes

    }, [slimes]);


    useEffect(() => {

        setSlimes(slimeset);

    }, [slimeset])


    // client 구독 관리
    useEffect(() => {

        if (client) {

            // 슬라임 위치 업데이트
            client.subscribe("/topic/game/move", (msg: IMessage) => {

                const ActionData = JSON.parse(msg.body) as ActionData
                msgQueue.current.push(ActionData)
                processQueue();

            })

            // 슬라임 추가
            client.subscribe('/topic/game/addSlime', (msg: IMessage) => {

                const parser: SlimeDTO = JSON.parse(msg.body)

                //dispatch(addSlime({ username: parser.username, slimedto: parser }))

                setSlimes(prev => ({
                    ...prev,
                    [parser.username]: parser
                }))
            })


            // 슬라임 삭제
            client.subscribe('/topic/game/deleteSlime', (msg: IMessage) => {

                const id = msg.body

                // 플레이어라면 플레이어 아이디 초기화
                if (id == username) {
                    dispatch(updateUsername({ username: '' }))
                }

                //dispatch(removeSlime({ username: id }))

                setSlimes(prev => {
                    const { [id]: _, ...rest } = prev
                    return rest
                });
            })

        }

        return () => {
            client?.unsubscribe('/topic/game/move')
            client?.unsubscribe('/topic/game/addSlime')
            client?.unsubscribe('/topic/game/deleteSlime')
        }

    }, [client])



    return (
        slimes &&
        <div style={{ position: "absolute", padding: 0 }}>
            {
                Object.values(slimes).map((value) => {
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
