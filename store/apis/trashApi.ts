import apiSlice from '@/store/slices/apiSlice';
import { addTrashDrops } from '@/data-sources/firebase-data-layer';
import type TrashDrop from '@/models/trash-drop';

const trashApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addTrashDrops: builder.mutation<Object, TrashDrop[]>({
            queryFn: async (trashDrops: TrashDrop[]) => {
                await addTrashDrops(trashDrops);
                return { data: {} };
            },
            onQueryStarted: async (trashDrops, { queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to add trash drops:', error);
                }
            },
            invalidatesTags: ['TrashDrop']
        })
    })
});

export const { useAddTrashDropsMutation } = trashApi;
