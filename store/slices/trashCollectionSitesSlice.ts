import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sites: {},
};

const trashCollectionSitesSlice = createSlice({
    name: "trashCollectionSites",
    initialState,
    reducers: {},
});

export const selectTrashCollectionSites = (state: any) =>
    state.trashCollectionSites.sites || {};

export default trashCollectionSitesSlice.reducer;