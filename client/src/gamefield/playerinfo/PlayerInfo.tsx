import { Client } from "@stomp/stompjs";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import './PlayerInfo.css';

interface Props {
    client: Client | undefined
}

export default function PlayerInfo({ client }: Props) {

    const lockTime = useSelector((root: RootState) => root.observer.observer?.lockTime)
    const actionPoint = useSelector((root: RootState) => root.observer.observer?.actionPoint)

    return (
        <div className="playerInfo">
            <div className="actionStats-txt" >
                <span>액션게이지</span>
            </div>
            <div className="actionStats-gauge">
                <div className="progress-bar" style={{ animation: lockTime > 0 ? `progressAnimationStrike ${lockTime}ms` : undefined }}/>
                <div className="actionPoint-txt">
                    {actionPoint === undefined ? 0 : actionPoint}
                </div>
            </div>
        </div>
    )
}
