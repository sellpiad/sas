import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";


export interface SlimeDTO {
    actionType: string
    id: string
    target: string // 위치
    attr: string
    direction: string
    duration: number
}

export interface ObjectProps {
    position: 'absolute' | 'relative'
    width: string
    height: string
    className?: string
}


export interface EffectData {
    actionType: string
    username?: string
    target: string
    lockTime?: number
    actionPoint?: number
}

export interface ActionData {
    username: string
    actionType: ActionType
    duration: number
    direction: string
    position?: string
    targetX?: number
    targetY?: number
    locktime?: number
    removedTime?: number
    buffCount?: number
    nuffCount?: number
}

export enum ActionType {
    IDLE = "IDLE",
    NOTCLASSIFIED = "NOTCLASSIFIED",
    STUCK = "STUCK",
    ATTACK = "ATTACK",
    MOVE = "MOVE",
    DRAW = "DRAW",
    CONQUER_START = "CONQUER_START",
    CONQUER_CANCEL = "CONQUER_CANCEL",
    CONQUER_COMPLETE = "CONQUER_COMPLETE",
    LOCKED = "LOCKED",
    LOCKON = "LOCKON",
    FEARED = "FEARED",
    DENIED = "DENIED"
}

export enum AttributeType {
    NORMAL = "NORMAL",
    FIRE = "FIRE",
    WATER = "WATER",
    GRASS = "GRASS"
}


export interface gameState {
    size: number
    isReady: boolean
}

const initialState: gameState = {
    size: 0, // 게임 사이즈 size*size
    isReady: false
}

export const game = createSlice({
    name: 'game',
    initialState,
    reducers: {
        initialGameSize(state, action) {
            state.size = action.payload.size
        },
        setReady(state) {
            state.isReady = true
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { initialGameSize, setReady } = game.actions

export default game.reducer

