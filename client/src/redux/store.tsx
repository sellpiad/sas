import { combineReducers, configureStore } from "@reduxjs/toolkit"
import persistReducer from "redux-persist/es/persistReducer"
import storage from "redux-persist/lib/storage"
import cubeSlice from "./CubeSlice.tsx"
import gameSlice from "./GameSlice.tsx"
import userSlice from "./UserSlice.tsx"

const reducers = combineReducers({
    user:userSlice,
    cube:cubeSlice,
    game:gameSlice
})

const persistConfig = {
    key: "root",
    storage
}

const persistedReducer = persistReducer(persistConfig,reducers)

export default configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})

export type RootState = ReturnType<typeof reducers>