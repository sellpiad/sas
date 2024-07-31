import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

type State = {
    isLogin: boolean
    isDead: boolean
    username: string | null
    attr: string | null
}

const initialState: State = {
    isLogin: false,
    isDead: false,
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
        updateDead(state, action: PayloadAction<{isDead : boolean}>){
            state.isDead = action.payload.isDead
        }
        ,
        updateAttr(state, action: PayloadAction<{ attr: string | null }>) {
            state.attr = action.payload.attr
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
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { changeLogin, addPlayer, deletePlayer, updateDead, updateUsername, updateAttr } = user.actions

export default user.reducer

