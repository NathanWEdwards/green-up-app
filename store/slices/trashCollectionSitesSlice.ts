import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchTrashCollectionSites } from '@/data-sources/firebase-data-layer';
import * as types from '@/constants/action-types';

const initialState = {
    sites: {}
};

export const getAllTrashCollectionSites = createAsyncThunk(
    'trashCollectionSites/getAllTrashCollectionSites',
    async (_, { dispatch }) => {
        try {
            const sites = await fetchTrashCollectionSites();
            return sites;
        } catch (error: any) {
            dispatch({
                type: types.FETCH_TRASH_COLLECTION_SITES_FAIL,
                payload:
                    error.message || 'Fetching trash collection sites failed'
            });
        }
    }
);

const trashCollectionSitesSlice = createSlice({
    name: 'trashCollectionSites',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            getAllTrashCollectionSites.fulfilled,
            (state, action) => {
                state.sites = action.payload || {};
            }
        );
    }
});

export const selectTrashCollectionSites = (state: any) =>
    state.trashCollectionSites.sites || {};

export default trashCollectionSitesSlice.reducer;
