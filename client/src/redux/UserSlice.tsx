import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

type State = {
    isLogin: boolean
    isPlaying: boolean
    isDead: boolean
    isLocked: boolean
    auth: string | null
    username: string | null
    attr: string | null
}

const initialState: State = {
    isLogin: false,
    isPlaying: false,
    isDead: false,
    isLocked: false,
    auth: null,
    username: null,
    attr: null,
}

export const user = createSlice({
    name: 'user',
    initialState,
    reducers: {
        changeLogin(state, action: PayloadAction<{ isLogin: boolean }>) {
            state.isLogin = action.payload.isLogin
        },
        updatePlaying(state, action: PayloadAction<{isPlaying: boolean}>){
            state.isPlaying = action.payload.isPlaying
        },
        updateDead(state, action: PayloadAction<{isDead : boolean}>){
            state.isDead = action.payload.isDead
        },
        updateLocked(state, action: PayloadAction<{isLocked: boolean}>){
            state.isLocked = action.payload.isLocked
        }
        ,
        updateAttr(state, action: PayloadAction<{ attr: string | null }>) {
            state.attr = action.payload.attr
        },
        updateAuth(state,action:PayloadAction<{ auth: string | null}>){
            state.auth = action.payload.auth
        },
        updateUsername(state, action: PayloadAction<{ username: string | null }>) {
            state.username = action.payload.username
        },
        addPlayer(state, action: PayloadAction<{ username: string, attr: string }>) {
            state.username = action.payload.username
            state.attr = action.payload.attr
            state.isDead =  false
        },
        deletePlayer(state) {
            state.username = null
            state.attr = null
            state.isDead = true
            state.isPlaying = false
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { changeLogin, addPlayer, deletePlayer, updateAuth, updatePlaying, updateDead, updateUsername, updateAttr, updateLocked } = user.actions

export default user.reducer

