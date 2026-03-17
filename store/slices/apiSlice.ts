import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

const apiSlice = createApi({
    baseQuery: fakeBaseQuery(),
    endpoints: () => ({}),
    tagTypes: ['SupplyDistributionSite', 'Town', 'TrashCollectionSite']
});

export default apiSlice;
