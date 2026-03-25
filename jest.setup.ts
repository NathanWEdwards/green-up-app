// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-offline
jest.mock('react-native-offline', () => ({
    createNetworkMiddleware:
        () => (store: any) => (next: any) => (action: any) =>
            next(action),
    offlineActionTypes: {
        CONNECTION_CHANGE: 'offline/CONNECTION_CHANGE'
    },
    reducer: (state = { isConnected: true }) => state
}));

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn()
    }),
    useLocalSearchParams: () => ({}),
    useSegments: () => [],
    useFocusEffect: jest.fn(),
    Link: 'Link',
    Slot: 'Slot'
}));

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
    app: jest.fn()
}));

jest.mock('@react-native-firebase/auth', () => () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    currentUser: { uid: 'mock-user-id', email: 'test@example.com' }
}));

jest.mock('@react-native-firebase/firestore', () => () => ({
    collection: jest.fn(() => ({
        doc: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            onSnapshot: jest.fn()
        })),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn(),
        onSnapshot: jest.fn(),
        add: jest.fn()
    }))
}));

jest.mock('@react-native-firebase/functions', () => () => ({
    httpsCallable: jest.fn(() => jest.fn())
}));

// Mock expo-location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest
        .fn()
        .mockResolvedValue({ status: 'granted' }),
    getCurrentPositionAsync: jest.fn().mockResolvedValue({
        coords: { latitude: 44.477, longitude: -73.212 }
    })
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockMapView = (props: any) =>
        React.createElement(View, { testID: 'map-view' }, props.children);
    const MockMarker = (props: any) =>
        React.createElement(View, { testID: 'map-marker' }, props.children);
    const MockCallout = (props: any) =>
        React.createElement(View, { testID: 'map-callout' }, props.children);
    const MockPolyline = (props: any) =>
        React.createElement(View, { testID: 'map-polyline' });

    return {
        __esModule: true,
        default: MockMapView,
        Marker: MockMarker,
        Callout: MockCallout,
        Polyline: MockPolyline,
        PROVIDER_GOOGLE: 'google'
    };
});

(global as any).navigator = {
    geolocation: {
        getCurrentPosition: jest.fn((success) =>
            success({
                coords: {
                    latitude: 44.477,
                    longitude: -73.212,
                    accuracy: 1,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                },
                timestamp: 0
            })
        ),
        watchPosition: jest.fn(),
        clearWatch: jest.fn()
    }
};
