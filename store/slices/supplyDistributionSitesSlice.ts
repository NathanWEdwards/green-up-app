import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import * as types from '@/constants/action-types';
import { fetchSupplyDistributionSites } from '@/data-sources/firebase-data-layer';
import { sanitize } from '@/libs/serify';

const initialState = {
    sites: {}
};

export const getAllSupplyDistributionSites = createAsyncThunk(
    'supplyDistributionSites/getAllSupplyDistributionSites',
    async (_, { dispatch }) => {
        try {
            const sites = await fetchSupplyDistributionSites();
            const serializable = sanitize(sites);
            return serializable;
        } catch (error: any) {
            console.log('error', error);
            dispatch({
                type: types.FETCH_SUPPLY_DISTRIBUTION_SITES_FAIL,
                payload:
                    error.message || 'Fetching supply distribution sites failed'
            });
        }
    }
);

const supplyDistributionSlice = createSlice({
    name: 'supplyDistributionSites',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            getAllSupplyDistributionSites.fulfilled,
            (state, action) => {
                state.sites = action.payload || {};
            }
        );
    }
});

export const selectSupplyDistributionSites = (state: any) =>
    state.supplyDistributionSites.sites || {};

export default supplyDistributionSlice.reducer;
