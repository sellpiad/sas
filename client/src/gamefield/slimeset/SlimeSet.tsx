import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SlimeDTO } from "../../redux/GameSlice.tsx";
import { ObserverType, updateObserverPos } from "../../redux/ObserverSlice.tsx";
import { RootState } from "../../redux/Store.tsx";
import { deletePlayer } from "../../redux/UserSlice.tsx";
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
    target: string | null // 위치
    direction: string
}


export default function SlimeSet({ client }: Props) {

    // 슬라임셋
    const slimeset: { [key: string]: SlimeDTO } = useSelector((state: RootState) => state.game.slimeset);
    const [slimes, setSlimes] = useState<{ [key: string]: SlimeDTO }>({})

    // 플레이어 아이디(게임 참가시)
    const username = useSelector((state: RootState) => state.user.username);
    const usernameRef = useRef<String>()
    const observer = useSelector((state: RootState) => state.observer.observer);
    const observerRef = useRef<ObserverType>()

    // 큐 관련
    const msgQueue = useRef<ActionData[]>([])
    const processing = useRef<boolean>(false)
    const slimesetRef = useRef(slimeset);

    // 삭제 관련
    const deleteQueue = useRef<string[]>([])
    const delelting = useRef<boolean>(false)


    // redux state 수정용
    const dispatch = useDispatch()

    // 큐에서 순차적으로 ActionData를 추출
    const processQueue = async () => {

        if (processing.current) return;

        processing.current = true;

        while (msgQueue.current.length > 0) {
            const action = msgQueue.current.shift()
            if (action) {
                await processAction(action)
            }
        }

        processing.current = false;
    }


    // ActionData 처리
    const processAction = async (action: ActionData) => {

        if (action && slimes) {

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
            }
        }
    }


    // 삭제큐에서 순차적으로 id 추출
    const processDeleteQueue = async () => {

        if (delelting.current) return;

        delelting.current = true;

        while (deleteQueue.current.length > 0) {
            const id = deleteQueue.current.shift()

            if (id) {
                await processDelete(id)
            }
        }

        delelting.current = false;

    }

    // 삭제 진행
    const processDelete = async (id: string) => {

        // 플레이어 사망 처리
        if (id === usernameRef.current) {
            dispatch(deletePlayer())
            // 옵저버 사망 시, 새로운 옵저버 요청
        } else if (id === observerRef.current?.username) {
            client?.publish({ destination: '/app/player/anyObserver' })
        }

        setSlimes(prev => {
            const newSlimes = { ...prev };

            delete newSlimes[id];

            return newSlimes;
        });

    }


    // slimeset이 변경될 때마다 slimesetRef를 업데이트
    useEffect(() => {

        slimesetRef.current = slimes

    }, [slimes]);

    useEffect(() => {

        setSlimes(slimeset);

    }, [slimeset])


    useEffect(() => {

        if (observer !== null) {
            observerRef.current = observer
        }

    }, [observer])

    useEffect(() => {

        if (username !== null) {
            usernameRef.current = username
        }

    }, [username])





    // client 구독 관리
    useEffect(() => {

        if (client) {

            // 슬라임 위치 업데이트
            client.subscribe("/topic/game/move", (msg: IMessage) => {

                const ActionData = JSON.parse(msg.body) as ActionData
                msgQueue.current.push(ActionData)
                processQueue();

                // 옵저버 시점 업데이트
                if (observerRef.current?.username === ActionData.username && ActionData.target !== null) {
                    dispatch(updateObserverPos({ observerPos: ActionData.target }))
                }
            })

            // 슬라임 추가
            client.subscribe('/topic/game/addSlime', (msg: IMessage) => {

                const parser: SlimeDTO = JSON.parse(msg.body)

                setSlimes(prev => ({
                    ...prev,
                    [parser.username]: parser
                }))
            })


            // 슬라임 삭제
            client.subscribe('/topic/game/deleteSlime', (msg: IMessage) => {

                const id = msg.body
                deleteQueue.current.push(id)
                processDeleteQueue()

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
