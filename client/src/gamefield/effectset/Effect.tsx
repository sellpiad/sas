import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import './Effect.css';

interface Props {
    actionType: string
    text: string | undefined
    target: string
}

export default function Effect({ actionType, text, target }: Props) {

    const boxWidth = useSelector((state: RootState) => state.cube.width)
    const boxHeight = useSelector((state: RootState) => state.cube.height)

    const [posX, setPosX] = useState<number>(0)
    const [posY, setPosY] = useState<number>(0)


    // 위치 업데이트 메소드
    const updateTarget = () => {

        const slimeBox = target !== undefined && document.getElementById(target)

        if (slimeBox) {
            setPosX(slimeBox.offsetLeft)
            setPosY(slimeBox.offsetTop)
        }

    }

    const getMsg = () => {

        switch (actionType) {
            case 'ATTACK':
                return '공격!'
            case 'DRAW':
                return '? 얜 친구야'
            case 'FEARED':
                return '무서워'
        }

    }

    useEffect(() => {
        updateTarget()
    }, [])


    return (
        <svg className={`${actionType.toLowerCase()}-msg`} xmlns="http://www.w3.org/2000/svg" width={boxWidth} height={boxHeight} viewBox={`0 0 ${boxWidth} ${boxHeight}`} preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", top: posY - (boxHeight / 2), left: posX }}>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline={"text-top"}>
                {getMsg()}
            </text>
        </svg>
    )
}