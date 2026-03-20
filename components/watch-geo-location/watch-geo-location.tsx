import * as Location from 'expo-location';
import React, { useEffect, useRef } from 'react';

import { getTownById } from '@/data-sources/firebase-data-layer';
import { findTownIdByCoordinates } from '@/libs/geo-helpers';
import { selectCurrentTownId, setCurrentTown } from '@/store/slices/townsSlice';
import { setUserLocation } from '@/store/slices/userLocationSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/**
 * Headless component that continuously watches the user's GPS position
 * and dispatches updates to the userLocation Redux slice.
 * Also computes the current town from coordinates and dispatches
 * setCurrentTown when the townId changes.
 */
export const WatchGeoLocation: React.FC = () => {
    const dispatch = useAppDispatch();
    const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
    const currentTownId = useAppSelector(selectCurrentTownId);
    const previousTownIdRef = useRef<string>(currentTownId);

    useEffect(() => {
        let isMounted = true;

        const startWatching = async () => {
            try {
                const { status } =
                    await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    dispatch(
                        setUserLocation({
                            coordinates: null,
                            error: 'Location permission denied. Please enable location services.'
                        })
                    );
                    return;
                }

                subscriptionRef.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 5000,
                        distanceInterval: 10
                    },
                    async (location) => {
                        if (!isMounted) return;

                        const coordinates = {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        };

                        dispatch(
                            setUserLocation({
                                coordinates,
                                error: null
                            })
                        );

                        // Compute townId from coordinates and update if changed
                        try {
                            const townId = findTownIdByCoordinates(coordinates);
                            if (
                                townId &&
                                townId !== previousTownIdRef.current
                            ) {
                                previousTownIdRef.current = townId;
                                const townData = await getTownById(townId);
                                if (isMounted) {
                                    dispatch(
                                        setCurrentTown({
                                            townId,
                                            townData: townData || {}
                                        })
                                    );
                                }
                            }
                        } catch (err) {
                            // Town lookup failed — don't block location updates
                            console.warn(
                                'Failed to resolve current town:',
                                err
                            );
                        }
                    }
                );
            } catch (error: any) {
                if (isMounted) {
                    dispatch(
                        setUserLocation({
                            coordinates: null,
                            error: error.message || 'Failed to watch location'
                        })
                    );
                }
            }
        };

        startWatching();

        return () => {
            isMounted = false;
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
            }
        };
    }, [dispatch]);

    return null;
};
