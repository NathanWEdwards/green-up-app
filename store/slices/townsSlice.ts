import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import townDataJson from '@/data-sources/town-data.json';
import { fetchTowns } from '@/data-sources/firebase-data-layer';
import * as types from '@/constants/action-types';

interface CurrentTown {
    id?: string;
    name?: string;
    description?: string;
    notes?: string;
    dropOffInstructions?: string;
    pickupInstructions?: string;
    roadsideDropOffAllowed?: boolean;
    allowsRoadside?: boolean;
    created?: string;
    updated?: string;
}

interface TownsState {
    townData: any;
    currentTownId: string;
    currentTown: CurrentTown;
}

const initialState: TownsState = {
    townData: townDataJson,
    currentTownId: '',
    currentTown: {}
};

export const getAllTowns = createAsyncThunk(
    'towns/getAllTowns',
    async (_, { dispatch }) => {
        try {
            const towns = await fetchTowns();
            return towns;
        } catch (error: any) {
            dispatch({
                type: types.FETCH_TOWN_DATA_FAIL,
                payload: error.message || 'Fetching town data failed'
            });
        }
    }
);

const townsSlice = createSlice({
    name: 'towns',
    initialState,
    reducers: {
        setCurrentTown: (
            state,
            action: PayloadAction<{ townId: string; townData: CurrentTown }>
        ) => {
            state.currentTownId = action.payload.townId;
            state.currentTown = action.payload.townData;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getAllTowns.fulfilled, (state, action) => {
            if (action.payload) {
                state.townData = { ...state.townData, ...action.payload };
            }
        });
    }
});

export const { setCurrentTown } = townsSlice.actions;

export const selectTownData = (state: any) => state.towns.townData;
export const selectCurrentTownId = (state: any): string =>
    state.towns.currentTownId;
export const selectCurrentTown = (state: any): CurrentTown =>
    state.towns.currentTown;

export default townsSlice.reducer;
