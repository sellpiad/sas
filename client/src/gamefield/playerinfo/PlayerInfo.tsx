import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EffectData } from "../../redux/GameSlice.tsx";
import { updateActionPoint, updateLockTime } from "../../redux/ObserverSlice.tsx";
import { RootState } from "../../redux/Store";
import './PlayerInfo.css';

interface Props {
    client: Client | undefined
}

const MSG_CONFIG = {
    MOVABLE: '이동가능!',
    CHARGING: '게이지 모으는 중!'
}

const validLockTypes = ['ATTACK', 'MOVE']

export default function PlayerInfo({ client }: Props) {

    const lockTime = useSelector((root: RootState) => root.observer.observer?.lockTime) || 0
    const actionPoint = useSelector((root: RootState) => root.observer.observer?.actionPoint)
    const observerName = useSelector((root: RootState) => root.observer.observer?.username)

    const nameRef = useRef<string>('')


    const dispatch = useDispatch()

    useEffect(() => {
        if (observerName != undefined) {
            nameRef.current = observerName
        }

    }, [observerName])

    useEffect(() => {
        if (client?.connected) {
            // 이펙트 추가

            client.subscribe("/topic/action", (msg: IMessage) => {

                const Effect = JSON.parse(msg.body) as EffectData

                // 락타임 설정
                if (validLockTypes.includes(Effect.actionType) && Effect.username === nameRef.current) {

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
        <div className="playerInfo">
            <div className="playerInfo-item">
                <div className="actionStats-txt" >
                    <span>액션게이지</span>
                </div>
                <div className="actionStats-gauge">
                    <div className="progress-bar" style={{ animation: lockTime > 0 ? `progressAnimationStrike ${lockTime}ms` : undefined, width: lockTime === 0 ? '100%' : '' }} />
                    <div className="actionPoint-txt">
                        {actionPoint === undefined ? 0 : actionPoint}
                    </div>
                </div>
                <div className="actionStats-movable-msg" >
                    <span>{lockTime === 0 ? MSG_CONFIG.MOVABLE : MSG_CONFIG.CHARGING}</span>
                </div>
            </div>
        </div>
    )
}