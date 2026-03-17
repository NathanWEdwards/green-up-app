import type Town from '@/models/town';
import apiSlice from '@/store/slices/apiSlice';
import { fetchTowns } from '@/data-sources/firebase-data-layer';
import { sanitize } from '@/libs/serify';

const townApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllTowns: builder.query<Record<string, Town>, void>({
            queryFn: async () => {
                const towns = await fetchTowns();
                const serializable = sanitize(towns);
                return { data: serializable };
            },
            providesTags: ['Town']
        })
    })
});

export const { useGetAllTownsQuery } = townApi;
