import { SlimeData, SlimeSetType } from "../dataReceiver/gameReceiver"
import { ActionData } from "../redux/GameSlice.tsx"


/**
 * slime set 상태 공유 closure.
 */

const slimePool = (function () {

    let slimeSet: SlimeSetType

    const callbacks: ((data: SlimeSetType | SlimeData | string) => void)[] = []

    function init() {
        slimeSet = new Map()
        callbacks.length = 0
    }

    function updatePool(data: SlimeSetType | SlimeData | string) {

        const newMap = new Map(slimeSet)

        if (typeof data === 'string') {
            newMap.delete(data)
            slimeSet = newMap
        } else if (data instanceof Map) {

            const sortedMap = new Map([...data.entries()].sort((a, b) => new Date(a[1].createdTime).getTime() - new Date(b[1].createdTime).getTime()))

            sortedMap.forEach((slime) => {
                const target = convertToCoor(slime.position)

                if (target) {
                    slime.targetX = target.targetX
                    slime.targetY = target.targetY
                }

                sortedMap.set(slime.username, slime)
            })

            slimeSet = sortedMap
        } else if (typeof data === 'object') {

            const target = convertToCoor(data.position)

            if (target) {
                data.targetX = target.targetX
                data.targetY = target.targetY

            }

            newMap.set(data.username, data)
            slimeSet = newMap
        }

        callbacks.forEach((callback) => {
            callback(slimeSet)
        })

    }

    function updateAction(actionData: ActionData) {

        const newMap = new Map(slimeSet)
        const targetSlime = slimeSet.get(actionData.username)

        if (actionData.position) {
            const target = convertToCoor(actionData.position)
            actionData = { ...actionData, ...target }
        }

        if (targetSlime) {
            newMap.set(actionData.username, { ...targetSlime, ...actionData })
            slimeSet = newMap
        }

        callbacks.forEach((callback) => {
            callback(slimeSet)
        })

    }

    function subscribe(callback) {
        callbacks.push(callback)
    }

    function convertToCoor(position: string) {
        const slimeBox = document.getElementById(position)

        if (slimeBox)
            return { targetX: slimeBox.offsetLeft, targetY: slimeBox.offsetTop }

    }

    return { updatePool, updateAction, subscribe, init }

})()

export default slimePool