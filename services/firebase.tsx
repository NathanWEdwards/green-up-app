import { getApp } from '@react-native-firebase/app';
import { connectFirestoreEmulator, getFirestore } from '@react-native-firebase/firestore';
import { HttpsCallable, getFunctions, httpsCallable } from '@react-native-firebase/functions';

export const app = getApp();
export const db = getFirestore();
export const functions = getFunctions(app, 'us-central1');
export const callableNearbySites: HttpsCallable = httpsCallable(functions, 'nearbySites');

if (__DEV__ && process.env.USE_EMULATORS) {
    connectFirestoreEmulator(
        db,
        process.env.EMULATOR_HOST || 'localhost',
        parseInt(process.env.FIRESTORE_EMULATOR_PORT || '8080')
    );
}