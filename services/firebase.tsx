import { getApp } from '@react-native-firebase/app';
import { connectAuthEmulator, getAuth } from '@react-native-firebase/auth';
import { connectFirestoreEmulator, getFirestore } from '@react-native-firebase/firestore';
import { HttpsCallable, getFunctions, httpsCallable } from '@react-native-firebase/functions';

export const app = getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');
export const callableNearbySites: HttpsCallable = httpsCallable(functions, 'nearbySites');

if (__DEV__ && process.env.USE_EMULATORS) {
    connectAuthEmulator(
        auth,
        `http://${process.env.EMULATOR_HOST || 'localhost'}:${process.env.AUTH_EMULATOR_PORT || '9099'}`
    );
    connectFirestoreEmulator(
        db,
        process.env.EMULATOR_HOST || 'localhost',
        parseInt(process.env.FIRESTORE_EMULATOR_PORT || '8080')
    );
}