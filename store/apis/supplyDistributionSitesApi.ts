import type SupplyDistributionSite from '@/models/supply-distribution-site';
import apiSlice from '@/store/slices/apiSlice';
import { fetchSupplyDistributionSites } from '@/data-sources/firebase-data-layer';
import { sanitize } from '@/libs/serify';

const supplyDistributionSitesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSupplyDistributionSites: builder.query<
            Record<string, SupplyDistributionSite>,
            void
        >({
            queryFn: async () => {
                const sites = await fetchSupplyDistributionSites();
                const serializable = sanitize(sites);
                return { data: serializable };
            },
            providesTags: ['SupplyDistributionSite']
        })
    })
});

export const { useGetSupplyDistributionSitesQuery } =
    supplyDistributionSitesApi;
