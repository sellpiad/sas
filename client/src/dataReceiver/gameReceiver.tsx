import { Client, IMessage } from "@stomp/stompjs"
import { ActionType, AttributeType } from "../redux/GameSlice.tsx"
import SlimeSet from "../gamefield/slimeset/SlimeSet.tsx"

/**
 * game 관련 데이터 수신용.
 * 
 */

export interface SlimeData {
    username: string
    nickname: string
    attr: AttributeType
    actionType: ActionType
    direction: string
    position: string
    targetX: number
    targetY: number
    duration: number
    locktime: number
    createdTime: number
    removedTime: number
    buffCount: number
    nuffCount: number
}

export type SlimeSetType = Map<string,SlimeData>

const gameReceiver = (function () {

    let client: Client

    const callbacks: ((data: SlimeSetType | SlimeData | string) => void)[] = []

    function initReceiver(stompClient: Client) {

        if (stompClient.connected && client === undefined) {

            client = stompClient

            // 접속 후 슬라임셋 요청.
            client.subscribe('/user/queue/game/slimes', (msg: IMessage) => {

                const parser = JSON.parse(msg.body) 

                const slimeSet = new Map(Object.entries(parser)) as SlimeSetType
                
                callbacks.forEach((callback) => {
                    callback(slimeSet)
                })

                client.unsubscribe('/user/queue/game/slimes')
            })


            // 슬라임 추가.
            client.subscribe('/topic/game/addSlime', (msg: IMessage) => {

                const slime = JSON.parse(msg.body) as SlimeData

                callbacks.forEach((callback) => {
                    callback(slime)
                })

            })


            // 슬라임 삭제.
            client.subscribe('/topic/game/deleteSlime', (msg: IMessage) => {

                const username = msg.body

                callbacks.forEach((callback) => {
                    callback(username)
                })

            })

            // 슬라임 요청.
            client.publish({ destination: '/app/game/slimes' })

        }

    }

    function subscribe(callback: (data: SlimeSetType | SlimeData | string) => void) {
        callbacks.push(callback)
    }
    
    return { initReceiver, subscribe }

})()

export default gameReceiver