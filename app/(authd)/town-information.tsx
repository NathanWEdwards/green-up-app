import { router } from 'expo-router';
import * as R from 'ramda';
import { FC, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DisposalSiteSelector from '@/components/disposal-site-selector';
import EnableLocationServices from '@/components/enable-location-services';
import WatchGeoLocation from '@/components/watch-geo-location';
import { removeNulls } from '@/libs/remove-nulls';
import Coordinates from '@/models/coordinates';
import User from '@/models/user';
import { selectUser } from '@/store/slices/loginSlice';
import { selectProfile } from '@/store/slices/profileSlice';
import { useGetTeamsQuery } from '@/store/apis/teamApi';
import { useGetAllTownsQuery } from '@/store/apis/townApi';
import { useGetTrashCollectionSitesQuery } from '@/store/apis/trashCollectionSitesApi';
import { selectUserLocation } from '@/store/slices/userLocationSlice';
import { defaultStyles } from '@/styles/default-styles';
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

interface TownInfoEntry {
    townId: string;
    townName: string;
    notes: string;
    description: string;
    dropOffInstructions: string;
    allowsRoadside: boolean;
    collectionSites: any[];
    pickupInstructions: string;
    updated?: string;
}

interface TeamOption {
    id: string;
    name: string | undefined;
}

const routes = [
    { key: 'townInfo', title: 'Town Info' }
    // { key: "bagTagger", title: "Bag Tagger" }
];

const TrashDisposalScreen: FC = () => {
    const loginUser = useAppSelector(selectUser);
    const profile = useAppSelector(selectProfile);
    const { data: townData } = useGetAllTownsQuery(undefined, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });
    const { data: allTeams } = useGetTeamsQuery(undefined, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });
    const { data: trashCollectionSitesData } = useGetTrashCollectionSitesQuery(
        undefined,
        {
            selectFromResult: (result) => ({
                ...result,
                data: result.data ?? {}
            })
        }
    );
    const userLocation = useAppSelector(selectUserLocation);

    const currentUser = useMemo(
        () => User.create({ ...loginUser, ...removeNulls(profile) }),
        [loginUser, profile]
    );

    const trashCollectionSites = useMemo(() => {
        return Object.values(trashCollectionSitesData).filter((site: any) => {
            const hasLatitude =
                typeof (site.coordinates || {}).latitude === 'number';
            const hasLongitude =
                typeof (site.coordinates || {}).longitude === 'number';
            return hasLatitude && hasLongitude;
        });
    }, [trashCollectionSitesData]);

    const townInfo: TownInfoEntry[] = useMemo(() => {
        const mapped = Object.entries(townData).map(
            ([id, data]: [string, any]): TownInfoEntry => ({
                townId: id,
                townName: data.name,
                notes: data.notes || '[No Notes]',
                description: data.description || '[No Description]',
                dropOffInstructions:
                    data.dropOffInstructions || '[ No Drop Off Instructions]',
                allowsRoadside: data.roadsideDropOffAllowed,
                collectionSites: (trashCollectionSites as any[]).filter(
                    (site: any) => site.townId === id
                ),
                pickupInstructions:
                    data.pickupInstructions || '[No Pickup Instructions]',
                updated: data.updated
            })
        );
        return mapped.filter(
            (entry) =>
                entry &&
                entry.townId &&
                entry.townName &&
                entry.hasOwnProperty('allowsRoadside')
        );
    }, [townData, trashCollectionSites]);

    const teamOptions: TeamOption[] = useMemo(() => {
        const options: TeamOption[] = [];
        const teamEntries = Object.entries(currentUser.teams || {});
        for (const [tid] of teamEntries) {
            try {
                const team = (allTeams as any)[tid];
                if (team) {
                    options.push({ id: tid, name: team.name });
                }
            } catch (err) {
                console.log('Error generating team option.');
            }
        }
        return options;
    }, [currentUser.teams, allTeams]);

    const [activeTab, setActiveTab] = useState(0);
    const navState = useMemo(() => ({ index: activeTab, routes }), [activeTab]);

    const initialMapLocation = useMemo(
        () =>
            userLocation?.coordinates
                ? Coordinates.create(userLocation.coordinates)
                : null,
        [userLocation?.coordinates]
    );

    const contents = useMemo(
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
                        <DisposalSiteSelector
                            userLocation={userLocation}
                            townInfo={townInfo}
                        />
                    )
                ]
            ])(),
        [userLocation?.error, initialMapLocation, navState]
    );

    return (
        <SafeAreaView style={styles.container}>
            <WatchGeoLocation />
            {contents}
        </SafeAreaView>
    );
};

export default TrashDisposalScreen;
