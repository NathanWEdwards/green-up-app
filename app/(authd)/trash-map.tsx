import React, { Fragment } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as R from 'ramda';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
    PixelRatio,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EnableLocationServices from '@/components/enable-location-services';
import MultiLineMapCallout from '@/components/multi-line-map-callout';
import WatchGeoLocation from '@/components/watch-geo-location';
import { offsetLocations } from '@/libs/geo-helpers';
import Address from '@/models/address';
import TrashDrop from '@/models/trash-drop';
import * as constants from '@/styles/constants';
import { defaultStyles } from '@/styles/default-styles';

import { selectUser } from '@/store/slices/loginSlice';
import { selectAllTeams } from '@/store/slices/teamsSlice';
import { selectTownData } from '@/store/slices/townsSlice';
import { selectTrashCollectionSites } from '@/store/slices/trashCollectionSitesSlice';
import { selectSupplyDistributionSites } from '@/store/slices/supplyDistributionSitesSlice';
import { selectUserLocation } from '@/store/slices/userLocationSlice';
import {
    selectTrashDrops,
    selectCollectedTrashToggle,
    selectUncollectedTrashToggle,
    selectMyTrashToggle,
    selectSupplyPickupToggle,
    selectTrashDropOffToggle,
    selectCleanAreasToggle
} from '@/store/slices/trashTrackerSlice';
import { useAppSelector } from '@/store/hooks';

const styles = StyleSheet.create(defaultStyles as any);

let buttonText = 22;
if (PixelRatio.get() <= 2) {
    buttonText = 16;
}

const buttonStyle = StyleSheet.create({
    label: {
        fontSize: buttonText,
        marginLeft: 5
    }
});

const TrashMap: React.FC = () => {
    const router = useRouter();

    const currentUser = useAppSelector(selectUser) || {};
    const teams = useAppSelector(selectAllTeams) || {};
    const trashCollectionSites = useAppSelector(selectTrashCollectionSites);
    const supplyDistributionSites = useAppSelector(
        selectSupplyDistributionSites
    );
    const userLocation = useAppSelector(selectUserLocation);
    const trashDrops = useAppSelector(selectTrashDrops);
    const collectedTrashToggle = useAppSelector(selectCollectedTrashToggle);
    const uncollectedTrashToggle = useAppSelector(selectUncollectedTrashToggle);
    const myTrashToggle = useAppSelector(selectMyTrashToggle);
    const supplyPickupToggle = useAppSelector(selectSupplyPickupToggle);
    const trashDropOffToggle = useAppSelector(selectTrashDropOffToggle);
    const cleanAreasToggle = useAppSelector(selectCleanAreasToggle);

    // Derive clean areas from teams
    const mapLocations = (team: any) =>
        (team.locations || []).map((l: any) => ({
            key: '',
            coordinates: l.coordinates,
            title: `${team.name || ''}`,
            description: 'claimed this area'
        }));

    const cleanAreas: any[] = R.compose(
        R.flatten,
        R.map((team: any) => mapLocations(team)),
        Object.values
    )(teams);

    // Filter drops to those with valid coordinates
    const drops: any[] = Object.values(trashDrops || {}).filter((drop: any) =>
        Boolean(
            drop.location &&
            drop.location.coordinates &&
            drop.location.coordinates.longitude &&
            drop.location.coordinates.latitude
        )
    );

    // Filter sites
    const collectionSites: any[] = R.compose(
        R.filter((site: any) =>
            Boolean(
                site.coordinates &&
                site.coordinates.latitude &&
                site.coordinates.longitude
            )
        ),
        Object.values
    )(trashCollectionSites);

    const distributionSites: any[] = R.compose(
        R.filter((site: any) =>
            Boolean(
                site.coordinates &&
                site.coordinates.latitude &&
                site.coordinates.longitude
            )
        ),
        Object.values
    )(supplyDistributionSites);

    const locationExists =
        userLocation &&
        userLocation.coordinates &&
        userLocation.coordinates.latitude &&
        userLocation.coordinates.longitude;

    const initialMapLocation = locationExists
        ? {
              latitude: Number(userLocation.coordinates.latitude),
              longitude: Number(userLocation.coordinates.longitude),
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
          }
        : null;

    const collectedTrashMarkers = (collectedTrashToggle ? drops : [])
        .filter((d: any) => d.wasCollected === true)
        .map((d: any) => (
            <Marker
                key={d.id}
                pinColor="turquoise"
                coordinate={d.location.coordinates}
                title={`${d.bagCount || '0'} bag(s)${(d.tags || []).length > 0 ? ' & other trash' : ''}`}
                stopPropagation={true}
            />
        ));

    const myTrashMarkers = (drops || [])
        .filter((d: any) =>
            Boolean(
                myTrashToggle &&
                !d.wasCollected &&
                d.createdBy &&
                d.createdBy.uid === currentUser.uid
            )
        )
        .map((d: any) => (
            <Marker
                key={d.id}
                pinColor="yellow"
                coordinate={d.location.coordinates}
                stopPropagation={true}
            >
                <MultiLineMapCallout
                    title="I Collected..."
                    description={`${d.bagCount || '0'} bag(s)${(d.tags || []).length > 0 ? ' & other trash' : ''}`}
                />
            </Marker>
        ));

    const uncollectedTrashMarkers = (uncollectedTrashToggle ? drops : [])
        .filter((d: any) =>
            Boolean(
                !d.wasCollected &&
                d.createdBy &&
                d.createdBy.uid !== currentUser.uid
            )
        )
        .map((d: any) => (
            <Marker
                key={d.id}
                pinColor="red"
                coordinate={d.location.coordinates}
                title={`${d.bagCount || '0'} bag(s)${(d.tags || []).length > 0 ? ' & other trash' : ''}`}
                stopPropagation={true}
            />
        ));

    const collectionSiteMarkers = offsetLocations(
        supplyPickupToggle ? distributionSites : [],
        trashDropOffToggle ? collectionSites : []
    ).map((d: any, i: number) => (
        <Marker
            key={`dropOffLocation${i}`}
            pinColor="blue"
            coordinate={d.coordinates}
            stopPropagation={true}
        >
            <MultiLineMapCallout
                title="Drop Off Location"
                description={`${d.name}, ${Address.toString(d.address)}`}
            />
        </Marker>
    ));

    const distributionSiteMarkers = (
        supplyPickupToggle ? distributionSites : []
    ).map((d: any, i: number) => (
        <Marker
            key={`supplyPickup${i}`}
            pinColor="green"
            coordinate={d.coordinates}
            stopPropagation={true}
        >
            <MultiLineMapCallout
                title="Supply Pickup Location"
                description={`${d.name}, ${Address.toString(d.address)}`}
            />
        </Marker>
    ));

    const cleanAreaMarkers = (cleanAreasToggle ? cleanAreas : []).map(
        (d: any, i: number) => (
            <Marker
                key={`cleanArea${i}`}
                pinColor="orange"
                coordinate={d.coordinates}
                stopPropagation={true}
            >
                <MultiLineMapCallout
                    title={`${d.title}`}
                    description={`${d.description}`}
                />
            </Marker>
        )
    );

    const allMarkers = distributionSiteMarkers
        .concat(collectionSiteMarkers)
        .concat(uncollectedTrashMarkers)
        .concat(myTrashMarkers)
        .concat(collectedTrashMarkers)
        .concat(cleanAreaMarkers);

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: constants.colorBackgroundDark }}
        >
            <WatchGeoLocation />
            {R.cond([
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
                        <View
                            style={[
                                styles.frame,
                                { display: 'flex', justifyContent: 'center' }
                            ]}
                        >
                            <Text
                                style={{
                                    fontSize: 20,
                                    color: 'white',
                                    textAlign: 'center'
                                }}
                            >
                                {'...Locating You'}
                            </Text>
                        </View>
                    )
                ],
                [
                    R.T,
                    () => (
                        <Fragment>
                            <MapView
                                initialRegion={initialMapLocation ?? undefined}
                                showsUserLocation={true}
                                showsMyLocationButton={true}
                                showsCompass={true}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    height: '100%',
                                    width: '100%',
                                    margin: 0,
                                    padding: 0
                                }}
                            >
                                {allMarkers}
                            </MapView>
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    left: 50,
                                    borderStyle: 'solid',
                                    borderColor: '#000',
                                    borderRadius: 40,
                                    borderWidth: 1,
                                    backgroundColor: '#FFF',
                                    padding: 10,
                                    height: 50,
                                    width: 50,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5
                                }}
                            >
                                <Ionicons
                                    name={
                                        Platform.OS === 'ios'
                                            ? 'options'
                                            : 'options'
                                    }
                                    size={30}
                                    color="#888"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    bottom: '1%',
                                    left: '2%',
                                    borderStyle: 'solid',
                                    borderColor: '#000',
                                    borderRadius: 2,
                                    borderWidth: 1,
                                    backgroundColor: '#FFF',
                                    padding: 3,
                                    width: '96%',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Notice: Recording a trash drop shares
                                        your location with Greenup
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    bottom: '5%',
                                    left: '15%',
                                    borderStyle: 'solid',
                                    borderColor: '#000',
                                    borderRadius: 20,
                                    borderWidth: 1,
                                    backgroundColor: '#FFF',
                                    padding: 10,
                                    height: 50,
                                    width: '70%',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5
                                }}
                                onPress={() =>
                                    router.push('/(authd)/record-trash' as any)
                                }
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="sack"
                                        size={28}
                                        color={constants.colorBackgroundDark}
                                        style={{ textAlign: 'left' }}
                                    />
                                    <Text style={buttonStyle.label}>
                                        Record Trash Bags
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Fragment>
                    )
                ]
            ])()}
        </SafeAreaView>
    );
};

export default TrashMap;
