import { createSlice } from '@reduxjs/toolkit';

interface InitialState {
    userIsLoggedIn: boolean | null;
    user: any | null;
    _persist: boolean;
}

const initialState: InitialState = {
    userIsLoggedIn: null,
    user: null,
    _persist: false
};

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        setUserIsLoggedIn: (state, action) => {
            if (action.payload) {
                state.userIsLoggedIn = true;
                const data = (({ uid, email, displayName, photoURL }) => ({
                    uid,
                    email,
                    displayName,
                    photoURL
                }))(action.payload);
                state.user = data;
            } else {
                state.userIsLoggedIn = false;
                state.user = null;
            }
        }
    }
});

export const { setUserIsLoggedIn } = loginSlice.actions;

export const selectUser = (state: any) => state.login.user;

export default loginSlice.reducer;
