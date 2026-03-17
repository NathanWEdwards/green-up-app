import apiSlice from '@/store/slices/apiSlice';
import type TrashCollectionSite from '@/models/trash-collection-site';
import { fetchTrashCollectionSites } from '@/data-sources/firebase-data-layer';
import { sanitize } from '@/libs/serify';

const trashCollectionSiesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTrashCollectionSites: builder.query<
            Record<string, TrashCollectionSite>,
            void
        >({
            queryFn: async () => {
                const sites = await fetchTrashCollectionSites();
                const serializable = sanitize(sites);
                return { data: serializable };
            },
            providesTags: ['TrashCollectionSite']
        })
    })
});

export const { useGetTrashCollectionSitesQuery } = trashCollectionSiesApi;
