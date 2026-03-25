import { mockUser } from './firebase-auth.js';

// Provide Firestore collections for testing without the need for emulator suite setup.
const mockOwner = {
    uid: mockUser.uid,
    displayName: mockUser.displayName,
    bio: 'bio',
    email: mockUser.email,
    memberStatus: 'ACCEPTED'
};

const mockData = {
    teams: {
        teamId: {
            active: true,
            created: new Date(2020, 1, 1, 0, 0, 0),
            date: 'Saturday, May 2, 2020',
            description: 'Meet for lunch.',
            end: '5pm',
            id: 'teamId',
            isMember: true,
            isPublic: false,
            location: 'location',
            locations: [],
            members: {},
            name: 'Canoe Carriers',
            notes: [],
            owner: mockOwner,
            startdate: '5am',
            town: 'Burlington',
            townId: 'BURLINGTON',
            cleanDate: '2020-05-02',
            cleanStartTime: '2020-05-02T05:00:00',
            cleanEndTime: '2020-05-02T17:00:00'
        }
    }
};

export const collection = (db, path) => path;
export const doc = (db, path, id) => (id ? `${path}/${id}` : path);
export const addDoc = async (collPath, data) => {
    const id = 'mock-id-' + Math.random().toString(36).substring(7);
    if (!mockData[collPath]) mockData[collPath] = {};
    mockData[collPath][id] = data;
    return { id };
};
export const getDoc = async (docRef) => {
    const parts = docRef.split('/');
    const id = parts.pop();
    const collName = parts.join('/');
    return {
        exists: !!(mockData[collName] && mockData[collName][id]),
        data: () => (mockData[collName] ? mockData[collName][id] : undefined),
        id,
        ref: docRef
    };
};
export const getDocs = async (queryRef) => {
    const collName = queryRef;
    const docs = mockData[collName]
        ? Object.keys(mockData[collName]).map((id) => ({
              id,
              exists: true,
              data: () => mockData[collName][id],
              ref: `${collName}/${id}`
          }))
        : [];
    return {
        docs,
        empty: docs.length === 0,
        forEach: (cb) => docs.forEach(cb)
    };
};
export const setDoc = async (docRef, data, options) => {
    const parts = docRef.split('/');
    const id = parts.pop();
    const collName = parts.join('/');
    if (!mockData[collName]) mockData[collName] = {};
    if (options && options.merge) {
        mockData[collName][id] = { ...mockData[collName][id], ...data };
    } else {
        mockData[collName][id] = data;
    }
};
export const updateDoc = async (docRef, data) =>
    setDoc(docRef, data, { merge: true });
export const deleteDoc = async (docRef) => {
    const parts = docRef.split('/');
    const id = parts.pop();
    const collName = parts.join('/');
    if (mockData[collName]) delete mockData[collName][id];
};
export const onSnapshot = (ref, nextOrObserver, error) => {
    const callback =
        typeof nextOrObserver === 'function'
            ? nextOrObserver
            : nextOrObserver.next;
    const isDoc = ref.includes('/');
    if (isDoc) {
        getDoc(ref).then(callback);
    } else {
        getDocs(ref).then(callback);
    }
    return () => {}; // unsubscribe function
};
export const query = (collRef, ...constraints) => collRef;
export const writeBatch = () => ({
    set: () => {},
    update: () => {},
    delete: () => {},
    commit: async () => {}
});

export const getFirestore = () => ({});
export default getFirestore;
