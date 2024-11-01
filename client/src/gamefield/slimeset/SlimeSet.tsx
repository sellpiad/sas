import { Client } from "@stomp/stompjs";
import React, { useEffect, useReducer, useState } from "react";
import { useSelector } from "react-redux";
import actionReceiver from "../../dataReceiver/actionReceiver.tsx";
import gameReceiver, { SlimeData, SlimeSetType } from "../../dataReceiver/gameReceiver.tsx";
import { ActionData, ObjectProps } from "../../redux/GameSlice.tsx";
import { RootState } from "../../redux/Store.tsx";
import Slime from "./Slime.tsx";
import slimePool from "../../dataPool/slimePool.tsx";
import useSlime from "../../customHook/useSlime.tsx";
import playerReceiver, { Player } from "../../dataReceiver/playerReceiver.tsx";


/**
 * Component SlimeSet
 * 슬라임 컴포넌트 집합
 * 
 */

interface Props {
    client: Client | undefined
}


export default function SlimeSet({ client }: Props) {

    const [slimeSet, dispatch] = useSlime()
    const [objectProps, setObjectProps] = useState<ObjectProps>({
        position: 'absolute',
        width: "0px",
        height: "0px"
    })

    // 슬라임 크기
    const boxWidth = useSelector((state: RootState) => state.cube.width)
    const boxHeight = useSelector((state: RootState) => state.cube.height)

    // 슬라임 크기 재조정
    useEffect(() => {

        setObjectProps(prev => ({ ...prev, width: boxWidth + "px", height: boxHeight + "px" }))

    }, [boxWidth, boxHeight])

    useEffect(() => {

        if (client?.connected) {

            // 슬라임 데이터 구독
            gameReceiver.subscribe((data: SlimeSetType | SlimeData | string) => {
                slimePool.updatePool(data)
            })

            // 슬라임 액션 데이터 구독
            actionReceiver.subscribe((data: ActionData) => {
                slimePool.updateAction(data)
            })

            // 슬라임 데이터와 액션 데이터 업데이트
            slimePool.subscribe((data: SlimeSetType) => {
                dispatch({ type: 'UPDATE_SLIME_SET', payload: data })
            })

        }

    }, [client?.connected])


    return (
        <div style={{ position: "absolute", padding: 0 }}>
            {
                Array.from(slimeSet.values()).map((value) => {
                    return <Slime key={value['username']}
                        objectProps={objectProps}
                        slimeData={value}
                    />
                })
            }
        </div>
    )
}
