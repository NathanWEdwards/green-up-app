import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    trashDrops: {},
    collectedTrashToggle: true,
    uncollectedTrashToggle: true,
    myTrashToggle: true,
    supplyPickupToggle: false,
    trashDropOffToggle: false,
    cleanAreasToggle: true
};

const trashTrackerSlice = createSlice({
    name: 'trashTracker',
    initialState,
    reducers: {
        toggleTrashOption: (state, action) => {
            const key = action.payload as keyof typeof initialState;
            if (key in state && typeof (state as any)[key] === 'boolean') {
                (state as any)[key] = !(state as any)[key];
            }
        }
    }
});

export const { toggleTrashOption } = trashTrackerSlice.actions;

export const selectTrashDrops = (state: any) =>
    state.trashTracker.trashDrops || {};
export const selectCollectedTrashToggle = (state: any) =>
    state.trashTracker.collectedTrashToggle;
export const selectUncollectedTrashToggle = (state: any) =>
    state.trashTracker.uncollectedTrashToggle;
export const selectMyTrashToggle = (state: any) =>
    state.trashTracker.myTrashToggle;
export const selectSupplyPickupToggle = (state: any) =>
    state.trashTracker.supplyPickupToggle;
export const selectTrashDropOffToggle = (state: any) =>
    state.trashTracker.trashDropOffToggle;
export const selectCleanAreasToggle = (state: any) =>
    state.trashTracker.cleanAreasToggle;

export default trashTrackerSlice.reducer;
