import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

const initialState = {
    gameStatus: 0,
    voteTime: 0,
    size: 0,
    boxSize: 0,
    width: 0,
    height: 0,
}

export const cube = createSlice({
    name: 'game',
    initialState,
    reducers: {
        changeGameSize(state,action) {
          state.size = action.payload.size  
        },
        changeGameStatus(state, action) {
            state.gameStatus = action.payload.gameStatus
        },
        changeVoteTime(state, action) {
            state.voteTime = action.payload.voteTime
        },
        boxResize(state,action){
            state.boxSize = action.payload.boxSize
        },
        resize(state,action) {
            state.width = action.payload.width
            state.height = action.payload.height
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { changeGameStatus, changeVoteTime, changeGameSize, boxResize, resize} = cube.actions

export default cube.reducer

