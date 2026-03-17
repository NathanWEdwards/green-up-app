import { combineReducers } from '@reduxjs/toolkit';

import apiSlice from '@/store/slices/apiSlice';
import aboutReducer from '@/store/slices/aboutSlice';
import celebrationsReducer from '@/store/slices/celebrationsSlice';
import loginReducer from '@/store/slices/loginSlice';
import messagesReducer from '@/store/slices/messagesSlice';
import networkReducer from '@/store/slices/networkSlice';
import profileReducer from '@/store/slices/profileSlice';
import sessionReducer from '@/store/slices/sessionSlice';
import teamsReducer from '@/store/slices/teamsSlice';
import townsReducer from '@/store/slices/townsSlice';
import trashCollectionSitesSlice from '@/store/slices/trashCollectionSitesSlice';
import trashTrackerReducer from '@/store/slices/trashTrackerSlice';
import userLocationReducer from '@/store/slices/userLocationSlice';

const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    about: aboutReducer,
    celebrations: celebrationsReducer,
    login: loginReducer,
    messages: messagesReducer,
    network: networkReducer,
    profile: profileReducer,
    session: sessionReducer,
    teams: teamsReducer,
    towns: townsReducer,
    trashCollectionSites: trashCollectionSitesSlice,
    trashTracker: trashTrackerReducer,
    userLocation: userLocationReducer
});

export default rootReducer;

export interface RootState {
    [apiSlice.reducerPath]: ReturnType<typeof apiSlice.reducer>;
    about: ReturnType<typeof aboutReducer>;
    celebrations: ReturnType<typeof celebrationsReducer>;
    login: ReturnType<typeof loginReducer>;
    messages: ReturnType<typeof messagesReducer>;
    network: ReturnType<typeof networkReducer>;
    profile: ReturnType<typeof profileReducer>;
    session: ReturnType<typeof sessionReducer>;
    teams: ReturnType<typeof teamsReducer>;
    towns: ReturnType<typeof townsReducer>;
    trashCollectionSites: ReturnType<typeof trashCollectionSitesSlice>;
    trashTracker: ReturnType<typeof trashTrackerReducer>;
    userLocation: ReturnType<typeof userLocationReducer>;
}
