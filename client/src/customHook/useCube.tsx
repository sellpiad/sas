import { Client, IMessage } from "@stomp/stompjs";
import { useEffect, useReducer } from "react";
import { AttributeType } from "../redux/GameSlice.tsx";

interface Props {
    client: Client | undefined
}

export type CubeType = {
    name: string
    attr: AttributeType
    posX: number
    posY: number
}

export type CubeSetType = { [posY: number]: { [name: string]: CubeType } }

type Action =
    | { type: 'INIT', payload: CubeSetType }
    | { type: 'UPDATE', payload: CubeType }

const cubeReducer = (state: CubeSetType, action: Action) => {

    switch (action.type) {
        case 'INIT':
            return { ...action.payload };
        case 'UPDATE':

            const cube = action.payload

            return {
                ...state, [cube.posY]:
                {
                    ...state[cube.posY], [cube.name]: cube
                }
            }
        default:
            return state;
    }
}

export default function useCube({ client }: Props) : CubeSetType{

    const [cubeset, dispatch] = useReducer(cubeReducer, [] as CubeSetType)

    useEffect(() => {

        if (client?.connected) {

            //초기 큐브셋 채널.
            client.subscribe('/user/queue/cube/cubeSet', (msg: IMessage) => {

                const parser = JSON.parse(msg.body)

                // posY 값을 기준으로 n*n 배열 만들기.
                const cubes = parser.reduce((result, cube) => {

                    const posY = cube['posY']

                    if (!result[posY])
                        result[posY] = {};

                    result[posY][cube.name] = cube

                    return result
                }, {} as CubeSetType)

                dispatch({ type: 'INIT', payload: cubes })

                // 초기화 후 채널 구독 삭제.
                client.unsubscribe('/user/queue/cube/cubeSet')
            })

            // 큐브 정보 업데이트 반영
            client.subscribe('/topic/cube/update', (msg: IMessage) => {

                const cube = JSON.parse(msg.body) as CubeType

                dispatch({ type: 'UPDATE', payload: cube })

            })

            // 초기 큐브셋 요청
            client.publish({ destination: '/app/cube/cubeSet' })

        }

    }, [client?.connected])


    return cubeset

}