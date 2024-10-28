import { useReducer } from "react";
import { Player } from "../dataReceiver/playerReceiver.tsx";

type Action = { type: 'UPDATE', payload: Player }

const playerReducer = (state: Player, action: Action) => {
    switch (action.type) {
        case 'UPDATE':
            return action.payload
        default:
            return state;
    }
}

export default function usePlayer() {

    const [player, setPlayer] = useReducer(playerReducer, {} as Player)

    return [player, setPlayer] as const

}