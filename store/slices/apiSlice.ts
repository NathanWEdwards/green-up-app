import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

const apiSlice = createApi({
    baseQuery: fakeBaseQuery(),
    endpoints: () => ({}),
    tagTypes: [
        'AssignedTeams',
        'SupplyDistributionSite',
        'Team',
        'TeamMembers',
        'TeamRequests',
        'Town',
        'TrashCollectionSite',
        'TrashDrop'
    ]
});

export default apiSlice;
