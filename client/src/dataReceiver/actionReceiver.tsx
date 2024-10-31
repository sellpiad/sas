import { Client, IMessage } from "@stomp/stompjs"
import { ActionData, ActionType } from "../redux/GameSlice.tsx"


/**
 * action 관련 데이터 수신용.
 * 
 */

type Callback = ((data: ActionData) => void)

const actionReceiver = (function () {

    let client: Client

    const callbacks: Callback[] = []

    function initReceiver(stompClient: Client) {

        if (stompClient.connected) {

            client = stompClient

            client.subscribe('/topic/action', (msg: IMessage) => {

                const actionData = JSON.parse(msg.body) as ActionData
                
                if (actionData.actionType !== ActionType.LOCKED)
                    callbacks.forEach((callback) => {
                        callback(actionData)
                    })
                   
            })

        }

    }

    function subscribe(callback: Callback) {
        callbacks.push(callback)
    }

    

    return { initReceiver, subscribe }

})()

export default actionReceiver