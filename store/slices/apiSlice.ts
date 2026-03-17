import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

const apiSlice = createApi({
    baseQuery: fakeBaseQuery(),
    endpoints: () => ({}),
    tagTypes: [
        'AssignedTeams',
        'SupplyDistributionSite',
        'Team',
        'TeamMembers',
        'Town',
        'TrashCollectionSite',
        'TrashDrop'
    ]
});

export default apiSlice;
