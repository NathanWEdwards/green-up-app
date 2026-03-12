import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import townDataJson from '@/data-sources/town-data.json';

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
    }
});

export const { setCurrentTown } = townsSlice.actions;

export const selectTownData = (state: any) => state.towns.townData;
export const selectCurrentTownId = (state: any): string =>
    state.towns.currentTownId;
export const selectCurrentTown = (state: any): CurrentTown =>
    state.towns.currentTown;

export default townsSlice.reducer;
