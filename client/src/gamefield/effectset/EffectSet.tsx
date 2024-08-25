import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useReducer } from "react";
import { useDispatch } from "react-redux";
import { EffectData } from "../../redux/GameSlice.tsx";
import Effect from "./Effect.tsx";
import { updateActionPoint, updateLockTime } from "../../redux/ObserverSlice.tsx";


interface Props {
    client: Client | undefined
}

type EffectState = { [key: string]: EffectData };

type EffectAction =
    | { type: 'ADD'; payload: EffectData }
    | { type: 'DELETE'; payload: EffectData }


const effectReducer = (state: EffectState, action: EffectAction) => {
    switch (action.type) {
        case 'ADD':
            return { ...state, [action.payload.actionType + '-' + action.payload.target]: action.payload }
        case 'DELETE':
            const newState = { ...state }
            delete newState[action.payload.actionType + '-' + action.payload.target]
            return newState
        default:
            return state
    }
};


export default function EffectSet({ client }: Props) {

    const [effects, setEffects] = useReducer(effectReducer, {})// 렌더링용

    const validActionTypes = ['ATTACK', 'FEARED', 'DRAW', 'LOCKED'];
    const validLockTypes = ['ATTACK', 'MOVE']

    const dispatch = useDispatch()

    const getActionText = (action: string) => {

        switch (action) {
            case 'ADD':
                return '나 등장!'
            case 'DELETE':
                return '이 몸 사망 :('
            case 'ATTACK':
                return 'ATTACK!!!'
        }

    }

    useEffect(() => {
        if (client?.connected) {
            // 이펙트 추가

            client.subscribe("/topic/game/move", (msg: IMessage) => {

                const Effect = JSON.parse(msg.body) as EffectData
              
                // 이펙트 텍스트 설정
                if (validActionTypes.includes(Effect.actionType)) {

                    setEffects({ type: 'ADD', payload: Effect })

                    setTimeout(() => {
                        setEffects({ type: 'DELETE', payload: Effect });
                    }, 1000);

                }

                // 락타임 설정
                if (validLockTypes.includes(Effect.actionType)) {

                    if (Effect.lockTime !== undefined) {
                        dispatch(updateLockTime({ lockTime: Effect.lockTime }))
                        dispatch(updateActionPoint({ actionPoint: Effect.actionPoint }))
                        setTimeout(() => {
                            dispatch(updateLockTime({ lockTime: 0 }))
                        }, Effect.lockTime)
                    }
                }
            })
        }

    }, [client])


    return (
        <div style={{ position: "absolute", padding: 0 }}>
            {
                Object.values(effects).map((value) => {
                    return <Effect key={value['actionType'] + '-' + value['target']}
                        actionType={value['actionType']}
                        target={value['target']}
                        text={getActionText(value['actionType'])}
                    />
                })
            }
        </div>
    )
}