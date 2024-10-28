import { useReducer, useState } from "react";
import { ActionData } from "../redux/GameSlice.tsx";

export enum PlayerState {
    REGSITER = 'REGISTER',
    NOT_IN_GAME = 'NOT_IN_GAME',
    IN_GAME = 'IN_GAME'

}

type Action = { type: 'UPDATE', payload: ActionData }
type ActionSet = Map<string, ActionData>

const actionReducer = (state: ActionSet, action: Action) => {
    switch (action.type) {
        case 'UPDATE':

            const newSet = new Map(state)
            newSet.set(action.payload.username, action.payload)

            return newSet

        default:
            return state;
    }
}

export default function useAction() {

    const [actionSet, dispatch] = useReducer(actionReducer, new Map() as ActionSet)

    return [actionSet, dispatch] as const

}