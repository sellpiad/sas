import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { SlimeData } from "../dataReceiver/gameReceiver";

export interface observerStatus {
    scale: number
    observer?: string,
    data?: SlimeData
}

const initialState: observerStatus = {
    scale: 1, // 게임 스케일
}

export const observer = createSlice({
    name: 'observer',
    initialState,
    reducers: {
        updateScale(state, action: PayloadAction<{ scale: number }>) {
            state.scale = action.payload.scale
        },
        updateObserver(state, action: PayloadAction<{ observer: string | undefined }>) {
            state.observer = action.payload.observer
        },
        updateObserverData(state, action: PayloadAction<{ data: SlimeData | undefined}>) {
            state.data = action.payload.data
        }
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    }
})

export const { updateScale, updateObserver,updateObserverData } = observer.actions

export default observer.reducer

