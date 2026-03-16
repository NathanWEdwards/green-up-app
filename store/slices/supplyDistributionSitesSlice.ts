import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { serify, defaultOptions } from '@karmaniverous/serify-deserify';

import * as types from '@/constants/action-types';
import { fetchSupplyDistributionSites } from '@/data-sources/firebase-data-layer';

const initialState = {
    sites: {}
};

export const getAllSupplyDistributionSites = createAsyncThunk(
    'supplyDistributionSites/getAllSupplyDistributionSites',
    async (_, { dispatch }) => {
        try {
            const sites = await fetchSupplyDistributionSites();
            const serializable: any = {};
            Object.values(sites).forEach((value: any) => {
                serializable[value.id] = serify(value.toJSON(), defaultOptions);
            });
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
