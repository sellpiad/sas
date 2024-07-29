import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

const initialState = {
    isLogined: false,
    name: '',
    token: null,
    username: null,
    selectedKey: '',
    attr: '',
    isDominating: false,
    position: ''
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
        updateUsername(state, action) {
            state.username = action.payload.username
        },
        updateSelectedKey(state, action) {
            state.selectedKey = action.payload.selectedKey
        },
        updateIsDominating(state,action){
            state.isDominating = action.payload.isDominating
        },
        updatePosition(state,action){
            state.position = action.payload.position
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { changeUserName, changeLogin, changeToken, updateUsername, updateSelectedKey, updateAttr, updateIsDominating,updatePosition } = user.actions

export default user.reducer

