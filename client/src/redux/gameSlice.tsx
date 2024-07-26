import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

const initialState = {
    gameStatus: 0,
    voteTime: 0,
    size: 0,
    width: 0,
    height: 0,
    scale: 1, // 게임 스케일
    observeX: 0, // 게임 시점용 좌표 x
    observeY: 0 // 게임 시점용 좌표 y
}

export const cube = createSlice({
    name: 'game',
    initialState,
    reducers: {
        changeGameSize(state, action) {
            state.size = action.payload.size
        },
        changeGameStatus(state, action) {
            state.gameStatus = action.payload.gameStatus
        },
        changeVoteTime(state, action) {
            state.voteTime = action.payload.voteTime
        },
        resize(state, action) {
            state.width = action.payload.width
            state.height = action.payload.height
        },
        updateScale(state, action) {
            state.scale = action.payload.scale
        },
        updateObserve(state, action) {
            state.observeX = action.payload.observeX
            state.observeY = action.payload.observeY
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { changeGameStatus, changeVoteTime, changeGameSize, resize, updateScale, updateObserve } = cube.actions

export default cube.reducer

