import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

const initialState = {
    isLogined: false,
    name: '',
    token: null,
    playerId: null,
    selectedKey: '',
    attr: '',
    isDominating: false
}

export const user = createSlice({
    name: 'user',
    initialState,
    reducers: {
        changeUserName(state, action) {
            state.name = action.payload.name;
        },
        changeLogin(state, action) {
            state.isLogined = action.payload.isLogined
        },
        changeToken(state, action) {
            state.token = action.payload.token
        },
        updateAttr(state,action) {
            state.attr = action.payload.attr
        },
        updatePlayerId(state, action) {
            state.playerId = action.payload.playerId
        },
        updateSelectedKey(state, action) {
            state.selectedKey = action.payload.selectedKey
        },
        updateIsDominating(state,action){
            state.isDominating = action.payload.isDominating
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { changeUserName, changeLogin, changeToken, updatePlayerId, updateSelectedKey, updateAttr, updateIsDominating } = user.actions

export default user.reducer

