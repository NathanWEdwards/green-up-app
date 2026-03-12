import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserLocationState {
    coordinates: { latitude: number; longitude: number } | null;
    error: string | null;
}

const initialState: UserLocationState = {
    coordinates: null,
    error: null,
};

const userLocationSlice = createSlice({
    name: "userLocation",
    initialState,
    reducers: {
        setUserLocation: (state, action: PayloadAction<UserLocationState>) => {
            state.coordinates = action.payload.coordinates;
            state.error = action.payload.error;
        },
    },
});

export const { setUserLocation } = userLocationSlice.actions;

export const selectUserLocation = (state: any) => state.userLocation;

export default userLocationSlice.reducer;