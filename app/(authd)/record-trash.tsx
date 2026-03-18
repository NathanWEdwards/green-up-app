import * as R from 'ramda';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EnableLocationServices from '@/components/enable-location-services';
import TrashDropForm from '@/components/trash-drop-form';
import WatchGeoLocation from '@/components/watch-geo-location';
import TrashDrop from '@/models/trash-drop';
import { defaultStyles } from '@/styles/default-styles';

import { selectUser } from '@/store/slices/loginSlice';
import { selectUserLocation } from '@/store/slices/userLocationSlice';
import { useAppSelector } from '@/store/hooks';

const styles = StyleSheet.create({
    ...(defaultStyles as any),
    locatingText: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center'
    },
    locatingWrapper: {
        display: 'flex',
        justifyContent: 'center'
    }
});

const RecordTrashScreen: React.FC = () => {
    const currentUser = useAppSelector(selectUser) || {};
    const userLocation = useAppSelector(selectUserLocation);

    const [drop, setDrop] = useState<any>(() => ({
        id: undefined as string | undefined,
        location: {},
        tags: [] as string[],
        bagCount: 1,
        wasCollected: false,
        createdBy: { uid: currentUser?.uid, email: currentUser?.email }
    }));

    const closeModal = useCallback(() => {
        const newDrop = TrashDrop.create({
            id: null,
            location: {},
            tags: [],
            bagCount: 1,
            wasCollected: false,
            createdBy: { uid: currentUser?.uid, email: currentUser?.email }
        });
        setDrop(newDrop);
    }, [currentUser?.uid, currentUser?.email]);

    const saveTrashDrop = useCallback(
        (myDrop: any, mode: string) => {
            // TODO: wire up to RTK thunk when map action creators are migrated
            closeModal();
        },
        [closeModal]
    );

    const initialMapLocation = useMemo(
        () =>
            userLocation?.coordinates
                ? {
                      latitude: Number(userLocation.coordinates.latitude),
                      longitude: Number(userLocation.coordinates.longitude),
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421
                  }
                : null,
        [userLocation?.coordinates]
    );

    const content = useMemo(
        () =>
            R.cond([
                [
                    () => Boolean(userLocation?.error),
                    () => (
                        <EnableLocationServices
                            errorMessage={userLocation?.error}
                        />
                    )
                ],
                [
                    () => !initialMapLocation,
                    () => (
                        <View style={[styles.frame, styles.locatingWrapper]}>
                            <Text style={styles.locatingText}>
                                {'...Locating You'}
                            </Text>
                        </View>
                    )
                ],
                [
                    R.T,
                    () => (
                        <TrashDropForm
                            existingDrop={drop}
                            onSave={saveTrashDrop}
                        />
                    )
                ]
            ])(),
        [userLocation?.error, initialMapLocation, drop, saveTrashDrop]
    );

    return (
        <SafeAreaView style={styles.container}>
            <WatchGeoLocation />
            {content}
        </SafeAreaView>
    );
};

export default RecordTrashScreen;
