import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

const initialState = {
    scale: 1, // 게임 스케일
    observeX: 0, // 게임 시점용 좌표 x
    observeY: 0, // 게임 시점용 좌표 y
    observerId: '', // 게임 시점용 아이디
    ObserverPos: '' // 게임 시점용 위치
}

export const cube = createSlice({
    name: 'observer',
    initialState,
    reducers: {
        updateScale(state, action) {
            state.scale = action.payload.scale
        },
        updateObserveCoor(state, action) {
            state.observeX = action.payload.observeX
            state.observeY = action.payload.observeY
        },
        updateObserverId(state,action){
            state.observerId = action.payload.observerId
        },
        updateObserverPos(state,action){
            state.ObserverPos = action.payload.observerPos
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const {updateScale, updateObserveCoor,updateObserverId,updateObserverPos } = cube.actions

export default cube.reducer

