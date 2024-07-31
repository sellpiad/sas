import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

const initialState = {
    playerCount: null,
    clickable: [],
    cubeNickname: '',
    width: 0,
    height: 0,
    isRendered: false
}

export const cube = createSlice({
    name: 'cube',
    initialState,
    reducers: {
        changePlayerCount(state, action) {
            state.playerCount = action.payload.playerCount
        },
        addClickable(state, action) {
            state.clickable = action.payload
        },
        updateCubeNickname(state,action){
            state.cubeNickname = action.payload.cubeNickname
        },
        updateSize(state, action) {
            state.width = action.payload.width
            state.height = action.payload.height
        },
        updateRenderingState(state, action) {
            state.isRendered = action.payload.isRendered
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { changePlayerCount, addClickable, updateSize, updateRenderingState,updateCubeNickname } = cube.actions

export default cube.reducer

