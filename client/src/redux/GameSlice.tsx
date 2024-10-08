import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";


export interface SlimeDTO {
    actionType: string
    username: string
    target: string // 위치
    attr: string
    direction: string
}


export interface EffectData {
    actionType: string
    username?: string
    target: string
    lockTime?: number
    actionPoint?: number
}

export interface ActionData {
    actionType: ActionType
    username: string
    target: string | null // 위치
    direction: string
    lockTime: number
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
    LOCKED = "LOCKED",
    LOCKON = "LOCKON",
    FEARED = "FEARED"
}


export interface gameState {
    size: number
    slimeset: { [key: string]: SlimeDTO }
    cubeset: []
    isReady: boolean
}

const initialState: gameState = {
    size: 0, // 게임 사이즈 size*size
    slimeset: {},
    cubeset: [],
    isReady: false
}

export const game = createSlice({
    name: 'game',
    initialState,
    reducers: {
        initialGameSize(state, action) {
            state.size = action.payload.size
        },
        initialCubeSet(state, action) {
            state.cubeset = action.payload.cubeset
        },
        initialSlimeSet(state, action) {
            state.slimeset = action.payload.slimeset
        },
        addSlime: (state, action) => {
            state.slimeset[action.payload.username] = action.payload.slimedto
        },
        removeSlime: (state, action) => {
            delete state.slimeset[action.payload.username]
        },
        setReady: (state) => {
            state.isReady = true
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { initialGameSize, initialCubeSet, initialSlimeSet, addSlime, removeSlime, setReady } = game.actions

export default game.reducer

