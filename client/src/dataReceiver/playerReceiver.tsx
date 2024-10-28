import { Client, IMessage } from "@stomp/stompjs"
import { user } from "../redux/UserSlice"

/**
 * player 관련 데이터 수신용.
 * 
 */

export enum PlayerState {
    REGSITER = 'REGISTER',
    NOT_IN_GAME = 'NOT_IN_GAME',
    IN_GAME = 'IN_GAME',
    IN_OBSERVATION = 'IN_OBSERVATION'

}

export interface Player {
    username: string
    state: PlayerState
}

const playerReceiver = (function () {

    let client: Client
    let player: Player

    const callbacks: ((data: Player) => void)[] = []

    function initReceiver(stompClient: Client) {

        if (stompClient.connected && client === undefined) {

            client = stompClient

            // 플레이어 현황 채널
            client.subscribe('/user/queue/player/state', (msg: IMessage) => {

                const state = JSON.parse(msg.body) as PlayerState

                player = { ...player, state: state }

                callbacks.forEach((callback) => {
                    callback(player)
                })
            })

            // 플레이어 이름 채널
            client.subscribe('/user/queue/player/username', (msg: IMessage) => {

                const username = msg.body as string

                player = { ...player, username: username }

                callbacks.forEach((callback) => {
                    callback(player)
                })
            })

            // 정보 요청
            client.publish({ destination: '/app/player/state' })
            client.publish({ destination: '/app/player/username' })

        }

    }

    function subscribe(callback: (data: Player) => void) {
        callbacks.push(callback)
    }

    function getPlayer() {
        return player
    }

    return { initReceiver, subscribe, getPlayer }

})()

export default playerReceiver