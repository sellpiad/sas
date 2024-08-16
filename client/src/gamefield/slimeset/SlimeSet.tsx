import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionData, SlimeDTO } from "../../redux/GameSlice.tsx";
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

type SlimesState = { [key: string]: SlimeDTO };

type SlimesAction =
    | { type: 'ADD'; payload: SlimeDTO }
    | { type: 'DELETE'; payload: string }
    | { type: 'ACTION'; payload: ActionData }
    | { type: 'INIT'; payload: SlimesState }


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

        if (client) {

            // 슬라임 위치 업데이트
            client.subscribe("/topic/game/move", (msg: IMessage) => {

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

                setSlime({ type: 'DELETE', payload: id })

                if (id === usernameRef.current) {
                    dispatch(deletePlayer())
                    // 옵저버 사망 시, 새로운 옵저버 요청
                } else if (id === observerRef.current?.username) {
                    client?.publish({ destination: '/app/player/anyObserver' })
                }

            })

        }
    }, [client])



    return (
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
