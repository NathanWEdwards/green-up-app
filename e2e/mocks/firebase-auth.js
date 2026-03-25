export const mockCredentials = {
    email: 'user@email.com',
    password: '4Sunshine&Flowers&GreenUp'
};

export const mockUser = {
    uid: 'detox-test-user-id',
    email: mockCredentials.email,
    displayName: 'Detox Testing'
};

let currentUser = null;
let authStateListeners = [];

export const signInWithEmailAndPassword = async (auth, email, password) => {
    currentUser = mockUser;
    authStateListeners.forEach((listener) => listener(currentUser));
    return { user: currentUser };
};

export const createUserWithEmailAndPassword = async (auth, email, password) => {
    currentUser = mockUser;
    authStateListeners.forEach((listener) => listener(currentUser));
    return { user: currentUser };
};

export const signOut = async (auth) => {
    currentUser = null;
    authStateListeners.forEach((listener) => listener(null));
};

export const onAuthStateChanged = (auth, listener) => {
    authStateListeners.push(listener);
    setTimeout(() => listener(currentUser), 0);
    return () => {
        authStateListeners = authStateListeners.filter((l) => l !== listener);
    };
};

export const sendPasswordResetEmail = async (auth, email) => {};
export const updateEmail = async (auth, email) => {};
export const updateProfile = async (auth, data) => {};
export const getAuth = () => ({ currentUser });

const auth = () => ({
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    get currentUser() {
        return currentUser;
    }
});
export default auth;
