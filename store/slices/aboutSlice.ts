import { createSlice } from '@reduxjs/toolkit';

interface ContactUs {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    addressLine1?: string;
    addressLine2?: string;
}

interface Faq {
    question: string;
    answer: string;
}

interface AboutState {
    date?: string | null;
    description?: string;
    faqs?: Faq[];
    name?: string;
    contactUs?: ContactUs;
}

const initialState: AboutState = {};

const aboutSlice = createSlice({
    name: 'about',
    initialState,
    reducers: {}
});

export const selectAboutDate = (state: any): string | null =>
    state.about.date ?? null;
export const selectAboutDescription = (state: any): string =>
    state.about.description ?? '';
export const selectAboutFaqs = (state: any): Faq[] => state.about.faqs ?? [];
export const selectAboutName = (state: any): string => state.about.name ?? '';
export const selectAboutContactUs = (state: any): ContactUs =>
    state.about.contactUs ?? {};

export default aboutSlice.reducer;
