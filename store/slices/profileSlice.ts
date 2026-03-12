import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import * as types from '@/constants/action-types';
import { updateProfile } from '@/data-sources/firebase-data-layer';
import User from '@/models/user';

const initialState = {};

export const saveProfile = createAsyncThunk(
    'profile/saveProfile',
    async (args: { profileData: any }, { dispatch }) => {
        const profileData = args.profileData;
        try {
            await updateProfile(User.create(profileData));
        } catch (error: any) {
            dispatch({
                type: types.UPDATE_PROFILE_FAIL,
                payload: error.message || 'Save profile failed'
            });
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(saveProfile.fulfilled, (state, action) => {});
    }
});

export const selectProfile = (state: any) => state.profile;

export default profileSlice.reducer;
