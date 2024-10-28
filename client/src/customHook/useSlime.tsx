import { useReducer } from "react";
import { SlimeSetType } from "../dataReceiver/gameReceiver.tsx";

/**
 * 슬라임 데이터와 액션 데이터를 받아서 게임용 데이터로 순차적으로 반환.
 * 데이터 처리용.
 */

type Action =
    | { type: 'UPDATE_SLIME_SET'; payload: SlimeSetType }

const slimeReducer = (state: SlimeSetType, action: Action) => {

    switch (action.type) {
        case 'UPDATE_SLIME_SET':
            state = action.payload
            return state
        default:
            return state
    }
};

export default function useSlime() {

    const [slimeSet, dispatch] = useReducer(slimeReducer, new Map() as SlimeSetType)

    return [slimeSet, dispatch] as const

}