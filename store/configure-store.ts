import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { createNetworkMiddleware } from "react-native-offline";
import { createLogger } from "redux-logger";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

import rootReducer, { RootState } from "@/reducers/index";

const persistConfig = {
    key: "root",
    storage: AsyncStorage,
    stateReconciler: autoMergeLevel2,
    blacklist: ["modals", "networkStatus"], // Add top-level store keys here to avoid persistence,
    timeout: 30000
};

const networkMiddleware = createNetworkMiddleware({
    queueReleaseThrottle: 200
});

const middlewares = [networkMiddleware];

if (__DEV__) {
    const logState = false
    const actionPayload = false
    const actionPayloadPretty = false
    const ignorePersist = (_getState: any, action: any) => {
        return !['persist/PERSIST', 'persist/REHYDRATE'].includes(action.type)
    };

    middlewares.push(createLogger({
        predicate: ignorePersist,
        stateTransformer: (state: any) => {
            if (!logState) {
                return '<state ignored in logs>'
            }

            return JSON.stringify(state, null, 2)
        },
        actionTransformer: (action: any) => {
            const { type, data } = action

            if (!actionPayload) {
                return `${type} payload=<payload ignored in logs>`
            }

            return `${type} payload=${JSON.stringify(data, null, actionPayloadPretty ? 2 : 0)}`;
        }
    }));
}

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
    })
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;