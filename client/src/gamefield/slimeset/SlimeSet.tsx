import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useReducer, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionData, ActionType, SlimeDTO } from "../../redux/GameSlice.tsx";
import { ObserverType, updateObserverPos } from "../../redux/ObserverSlice.tsx";
import { RootState } from "../../redux/Store.tsx";
import { deletePlayer, updateLocked } from "../../redux/UserSlice.tsx";
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

type SlimesState = { [key: string]: SlimeDTO };

type SlimesAction =
    | { type: 'ADD'; payload: SlimeDTO }
    | { type: 'DELETE'; payload: string }
    | { type: 'ACTION'; payload: ActionData }
    | { type: 'INIT'; payload: SlimesState }


const slimeReducer = (state: SlimesState, action: SlimesAction) => {
    switch (action.type) {
        case 'ADD':
            return { ...state, [action.payload.username]: action.payload }
        case 'DELETE':
            const newState = { ...state }
            delete newState[action.payload]
            return newState
        case 'ACTION':
            const slime = state[action.payload.username];
            if (slime) {
                const moveSlime = {
                    ...slime,
                    actionType: action.payload.actionType,
                    target: action.payload.target ?? slime.target,
                    direction: action.payload.direction
                };
                return { ...state, [moveSlime.username]: moveSlime };
            }
            return state;
        case 'INIT':
            state = action.payload
        default:
            return state
    }
};

export default function SlimeSet({ client }: Props) {


    // 슬라임셋
    const slimeset: { [key: string]: SlimeDTO } = useSelector((state: RootState) => state.game.slimeset); // 초기화용

    const [slimes, setSlime] = useReducer(slimeReducer, {})// 렌더링용

    // 플레이어 아이디(게임 참가시)
    const username = useSelector((state: RootState) => state.user.username);
    const usernameRef = useRef<String>()
    const observer = useSelector((state: RootState) => state.observer.observer);
    const observerRef = useRef<ObserverType>()

    // redux state 수정용
    const dispatch = useDispatch()


    // 슬라임셋이 한번에 업데이트 될 때
    useEffect(() => {

        setSlime({ type: 'INIT', payload: slimeset })

    }, [slimeset])


    // 옵저버가 변경될 때마다 
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

        if (client?.connected) {

            // 슬라임 위치 업데이트
            client.subscribe("/topic/action", (msg: IMessage) => {

                const ActionData = JSON.parse(msg.body) as ActionData

                setSlime({ type: 'ACTION', payload: ActionData })

                // 옵저버 시점 업데이트
                if (observerRef.current?.username === ActionData.username && ActionData.target !== null) {
                    dispatch(updateObserverPos({ observerPos: ActionData.target }))

                }
            })

            // 슬라임 추가
            client.subscribe('/topic/game/addSlime', (msg: IMessage) => {

                const parser: SlimeDTO = JSON.parse(msg.body)

                setSlime({ type: 'ADD', payload: parser })

            })


            // 슬라임 삭제
            client.subscribe('/topic/game/deleteSlime', (msg: IMessage) => {

                const id = msg.body

                if (id === usernameRef.current) {   // 플레이어 사망 처리
                    dispatch(deletePlayer())

                } else if (id === observerRef.current?.username) {   // 옵저버 사망 처리
                    client?.publish({ destination: '/app/player/anyObserver' })
                }

                setSlime({ type: 'DELETE', payload: id })

            })

        }

    }, [client])



    return (
        <div style={{ position: "absolute", padding: 0 }}>
            {
                Object.values(slimes).map((value) => {
                    return <Slime key={value['username']}
                        playerId={value['username']}
                        actionType={value['actionType'] as ActionType}
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
