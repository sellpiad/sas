import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useReducer, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EffectData } from "../../redux/GameSlice.tsx";
import Effect from "./Effect.tsx";
import { updateActionPoint, updateLockTime } from "../../redux/ObserverSlice.tsx";
import { RootState } from "../../redux/Store.tsx";


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

    const observer = useSelector((root:RootState) => root.observer.observer)
    const observerPos = useSelector((root:RootState) => root.observer.observerPos)

    const dispatch = useDispatch()

    const posRef = useRef<string>('')

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

    useEffect(()=>{
        if(observerPos != null){
            posRef.current = observerPos
        }
    },[observerPos])

    useEffect(() => {
        if (client?.connected) {
            // 이펙트 추가

            client.subscribe("/topic/game/action", (msg: IMessage) => {

                const Effect = JSON.parse(msg.body) as EffectData
              
                // 이펙트 텍스트 설정
                if (validActionTypes.includes(Effect.actionType)) {

                    setEffects({ type: 'ADD', payload: Effect })

                    setTimeout(() => {
                        setEffects({ type: 'DELETE', payload: Effect });
                    }, 1000);

                }
            })

            client.subscribe('/topic/game/lockon', (msg: IMessage) => {

                if (observer?.username === msg.body) {

                    const effect:EffectData = {
                        actionType:'LOCKON',
                        target: posRef.current
                    }

                    setEffects({ type: 'ADD', payload: effect })

                    setTimeout(() => {
                        setEffects({ type: 'DELETE', payload: effect });
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
                        text={getActionText(value['actionType'])}
                    />
                })
            }
        </div>
    )
}