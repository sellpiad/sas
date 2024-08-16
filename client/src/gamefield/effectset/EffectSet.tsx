import { Client, IMessage } from "@stomp/stompjs"
import { useEffect, useReducer } from "react"
import { EffectData } from "../../redux/GameSlice";
import Effect from "./Effect.tsx";
import React from "react";


interface Props {
    client: Client | undefined
}


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

type EffectState = { [key: string]: EffectData };

type EffectAction =
    | { type: 'ADD'; payload: EffectData }
    | { type: 'DELETE'; payload: EffectData }


export default function EffectSet({ client }: Props) {

    const [effects, setEffects] = useReducer(effectReducer, {})// 렌더링용

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
        if (client) {
            // 이펙트 추가
            client.subscribe("/topic/game/move", (msg: IMessage) => {

                const Effect = JSON.parse(msg.body) as EffectData

                if (Effect.actionType === 'ATTACK' || 'FEARED' || 'DRAW') {
                    setEffects({ type: 'ADD', payload: Effect })

                    setTimeout(() => {
                        setEffects({ type: 'DELETE', payload: Effect });
                    }, 1000);

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
                        text={getActionText(value['actionType'])} />
                })
            }
        </div>
    )
}