import { Client } from "@stomp/stompjs";
import React, { useEffect, useRef, useState } from "react";
import './PlayerInfo.css';
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";

interface Props {
    client: Client | undefined
}

const MSG_CONFIG = {
    MOVABLE: '이동가능!',
    CHARGING: '게이지 모으는 중!'
}

export default function PlayerInfo({ client }: Props) {

    // 옵저버 객체
    const data = useSelector((state: RootState) => state.observer.data)

    const removedTime = useRef<number>(0)
    const [lifeTime,setLifeTime] = useState<number>(0)

    const setTimer = (currentTime) => {

        const time = (removedTime.current - Date.now()) / 1000 // 초 변환

        setLifeTime(Math.max(time,0))

        requestAnimationFrame(setTimer)
    }


    const calcalateLifeTime = (lifeTime: number) => {

        requestAnimationFrame(calcalateLifeTime)
    }

    const getState = (buff:number,nuff:number) => {

        const state = buff - nuff

        if(state > 0)
            return "버프 효과(⇑)가 " +  data?.buffCount + "칸 남았습니다."
        else if(state < 0)
            return "너프 효과(⇓)가 " + data?.nuffCount + "칸 남았습니다."

    }

    useEffect(() => {
        if (client?.connected) {
            // 이펙트 추가
            const timer = requestAnimationFrame(setTimer)

            return () => cancelAnimationFrame(timer)
        }

    }, [client])


    // 옵저버 변경 시 requestAnimation 참조용 시간 업데이트.
    useEffect(() => {
        
        if (data){
            removedTime.current = new Date(data.removedTime).getTime()
        }

    }, [data])


    return (
        <div className="playerInfo">
            <div className="playerInfo-item">
                <div className="actionStats-txt" >
                    <span>남은 수명</span>
                </div>
                <div className="actionStats-gauge">
                    <div className="progress-bar" style={{ animation: lifeTime > 0 ? `progressAnimationStrike ${lifeTime}ms` : undefined, width: lifeTime !== 0 ? (lifeTime/30)*100 +'%' : '' }} />
                    <div className="actionPoint-txt">
                        {lifeTime.toFixed(2)} 초
                    </div>
                </div>
                <div className="stats-txt" >
                    <span>{getState(data?.buffCount,data?.nuffCount)}</span>
                </div>
            </div>
        </div>
    )
}