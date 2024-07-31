import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";


export interface ObserverType {
    username: string
    nickname: string
    position: string
    attr: string
    kill: number
    conquer: number
}

export interface observerStatus {
    scale: number
    observeX: number
    observeY: number
    observerPos: string | null
    observer: ObserverType | null
}

const initialState: observerStatus = {
    scale: 1, // 게임 스케일
    observeX: 0, // 게임 시점용 좌표 x
    observeY: 0, // 게임 시점용 좌표 y
    observerPos: null, // 게임 시점용 위치, 예시) slimebox33 
    observer: null // 옵저버 객체
}


export const cube = createSlice({
    name: 'observer',
    initialState,
    reducers: {
        updateScale(state, action: PayloadAction<{ scale: number }>) {
            state.scale = action.payload.scale
        },
        updateObserverCoor(state, action: PayloadAction<{ observeX: number, observeY: number }>) {
            state.observeX = action.payload.observeX
            state.observeY = action.payload.observeY
        },
        updateObserver(state, action: PayloadAction<{ observer: ObserverType | null }>) {
            state.observer = action.payload.observer
        },
        updateObserverPos(state, action: PayloadAction<{ observerPos: string }>) {
            state.observerPos = action.payload.observerPos
        },
        incKill(state) {
            if (state.observer !== null) {
                state.observer.kill = state.observer.kill + 1
            }
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { updateScale, updateObserver, updateObserverCoor, updateObserverPos, incKill } = cube.actions

export default cube.reducer

