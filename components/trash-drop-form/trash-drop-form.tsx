// @flow
import { LineDivider } from '@/components/divider';
import EnableLocationServices from '@/components/enable-location-services';
import TagToggle from '@/components/tag-toggle';

import { isInGreenUpWindow } from '@/libs/green-up-day-calculators'; // TODO: Add out of window warning
import { removeNulls } from '@/libs/remove-nulls';
import User from '@/models/user';
import { selectUser } from '@/store/slices/loginSlice';
import { selectProfile } from '@/store/slices/profileSlice';
import {
    selectCurrentTown,
    selectCurrentTownId
} from '@/store/slices/townsSlice';
import {
    useGetAssignedTeamsQuery,
    useGetTeamsQuery
} from '@/store/apis/teamApi';
import { useGetAllTownsQuery } from '@/store/apis/townApi';
import { useGetTrashCollectionSitesQuery } from '@/store/apis/trashCollectionSitesApi';
import { selectUserLocation } from '@/store/slices/userLocationSlice';
import { defaultStyles } from '@/styles/default-styles';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as R from 'ramda';
import React, { Fragment, useEffect, useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { SecondaryButton } from '../button';
import ButtonBar from '../button-bar';
import MiniMap from '../mini-map';
import Site from '../site';
import SiteSelector from '../site-selector';
import TownInformation from '../town-information';
import { useAppSelector } from '@/store/hooks';

type LocationType = {
    id: string;
    name: string;
    coordinates: { longitude: number; latitude: number };
    error: any;
};

const myStyles = {};
const combinedStyles = Object.assign({}, defaultStyles, myStyles);

const styles = StyleSheet.create(combinedStyles as any);

interface TrashDropFormProps {
    existingDrop?: any;
    onSave: (drop: any, mode: string) => void;
}

export const TrashDropForm: React.FC<TrashDropFormProps> = ({
    existingDrop,
    onSave
}) => {
    // --- Redux state via useAppSelector ---
    const loginUser = useAppSelector(selectUser) || {};
    const profile = useAppSelector(selectProfile) || {};
    const currentUser = User.create({ ...loginUser, ...removeNulls(profile) });

    const { data: townData } = useGetAllTownsQuery(undefined, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });
    const { data: trashCollectionSites } = useGetTrashCollectionSitesQuery(
        undefined,
        {
            selectFromResult: (result) => ({
                ...result,
                data: result.data ?? {}
            })
        }
    );
    const userLocation =
        useAppSelector(selectUserLocation) || ({} as LocationType);

    const { data: allAssignedTeams } = useGetAssignedTeamsQuery(
        currentUser!.uid!,
        {
            selectFromResult: (result) => ({
                ...result,
                data: result.data ?? {}
            })
        }
    );

    // --- Component state via useState ---
    const [assignedTeamIds, setAssignedTeamIds] = useState(
        Object.keys(allAssignedTeams)
    );
    const [teamCount, setTeamCount] = useState(assignedTeamIds.length);
    const [defaultTeam, setDefaultTeam] = useState(
        allAssignedTeams[assignedTeamIds[0]]
    );

    useEffect(() => {
        setAssignedTeamIds(Object.keys(allAssignedTeams));
        setTeamCount(assignedTeamIds.length);
        setDefaultTeam(allAssignedTeams[assignedTeamIds[0]]);
    }, [allAssignedTeams]);

    const [drop, setDrop] = useState({
        id: existingDrop ? existingDrop.id : null,
        active: existingDrop ? existingDrop.active : true,
        teamId: existingDrop
            ? existingDrop.teamId
            : (defaultTeam || {}).id || null,
        collectionSiteId: existingDrop ? existingDrop.collectionSiteId : null,
        created: existingDrop ? existingDrop.created : new Date(),
        wasCollected: existingDrop ? existingDrop.wasCollected : false,
        location: existingDrop
            ? existingDrop.location
            : {
                  coordinates: {
                      latitude: userLocation?.coordinates?.latitude || 0,
                      longitude: userLocation?.coordinates?.longitude || 0
                  }
              },
        coordinates: existingDrop
            ? existingDrop.location?.coordinates
            : {
                  latitude: userLocation?.coordinates?.latitude || 0,
                  longitude: userLocation?.coordinates?.longitude || 0
              },
        tags: existingDrop ? existingDrop.tags : [],
        createdBy: existingDrop
            ? existingDrop.createdBy
            : { uid: currentUser.uid, email: currentUser.email },
        bagCount: existingDrop ? existingDrop.bagCount : 1
    });
    const [refKey, setRefKey] = useState(0);
    const [modal, setModal] = useState<string | null>(null);

    const currentTownId = useAppSelector(selectCurrentTownId);
    const currentTown = useAppSelector(selectCurrentTown);

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

    const toggleTag =
        (tag: string): ((a: any) => any) =>
        () => {
            const hasTag = (drop.tags || []).indexOf(tag) > -1;
            const tags = hasTag
                ? (drop.tags || []).filter(
                      (_tag: string): boolean => _tag !== tag
                  )
                : (drop.tags || []).concat(tag);
            setDrop({ ...drop, tags });
        };

    if (!currentTown || !currentTown.id) {
        return (
            <Fragment>
                <SafeAreaView
                    style={{
                        borderTopWidth: 1,
                        borderStyle: 'solid',
                        borderColor: 'white',
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        paddingTop: 20
                    }}
                >
                    <Text style={{ color: 'white' }}>
                        Having trouble locating you. Please try again in a bit!
                    </Text>
                </SafeAreaView>
            </Fragment>
        );
    }

    const sitesArray = Array.isArray(trashCollectionSites)
        ? trashCollectionSites
        : Object.values(trashCollectionSites);
    const selectedSite = sitesArray.find(
        (site: any) => site.id === drop.collectionSiteId
    );
    const townHasSites = sitesArray.some(
        (site: any) => site.townId === currentTownId
    );

    const getDropButtons = R.cond([
        [
            () => Boolean(townHasSites && currentTown.allowsRoadside),
            () => (
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}
                >
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            backgroundColor: '#333',
                            flex: 0.49,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}
                        onPress={() => {
                            setDrop({ ...drop, location: userLocation });
                        }}
                    >
                        <FontAwesome
                            size={30}
                            style={{ color: '#DDD', marginRight: 10 }}
                            name={'map-marker'}
                        />
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={{ color: '#DDD', flexWrap: 'wrap' }}>
                                Drop Bags Here
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            backgroundColor: '#333',
                            flex: 0.49,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}
                        onPress={() => {
                            setModal('site-selector');
                        }}
                    >
                        <FontAwesome
                            style={{ color: '#DDD', marginRight: 10 }}
                            size={30}
                            name={'map-signs'}
                        />
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text
                                style={{
                                    flex: 1,
                                    color: '#DDD',
                                    flexWrap: 'wrap'
                                }}
                            >
                                Find Collection Site
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        ],
        [
            () => Boolean(currentTown.allowsRoadside),
            () => (
                <>
                    <SecondaryButton>
                        <FontAwesome
                            size={30}
                            style={{ color: '#DDD', marginRight: 10 }}
                            name={'map-marker'}
                        />
                        <Text style={{ color: 'white' }}>Drop Bag Here</Text>
                    </SecondaryButton>
                </>
            )
        ],
        [
            R.T,
            () => (
                <View style={{ width: '100%', height: 60 }}>
                    <SecondaryButton
                        onPress={() => {
                            setModal('site-selector');
                        }}
                    >
                        <MaterialCommunityIcons
                            name="earth"
                            size={25}
                            style={{ marginRight: 10 }}
                            color={'#555'}
                        />
                        <Text style={{ color: 'white' }}>
                            {'Find a trash collection site'}
                        </Text>
                    </SecondaryButton>
                </View>
            )
        ]
    ]);

    let saveBtn = {
        onClick: () => {
            let mode = 'new';
            if (existingDrop) {
                mode = 'update';
            }
            onSave(drop, mode);
        },
        text: existingDrop ? 'Update' : 'Save'
    };
    let deleteBtn = {
        onClick: () => {
            onSave(drop, 'delete');
        },
        text: 'Remove'
    };
    let btnConfig = [saveBtn];
    if (existingDrop) btnConfig.push(deleteBtn);

    const clickOnMap = (loc: any) => {
        setDrop({
            ...drop,
            collectionSiteId: null,
            location: { ...drop.location, coordinates: loc }
        });
        setRefKey(refKey + 1);
    };

    return (
        <Fragment>
            {R.cond([
                [
                    () => !isInGreenUpWindow(),
                    () => (
                        <Fragment>
                            <SafeAreaView
                                style={{
                                    borderTopWidth: 1,
                                    borderStyle: 'solid',
                                    borderColor: 'white',
                                    flex: 1,
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    padding: 50
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'white',
                                        paddingBottom: 20
                                    }}
                                >
                                    You cannot collect trash until the Monday
                                    before Green Up Day!
                                </Text>
                                <Text
                                    style={{
                                        color: 'white',
                                        paddingBottom: 20
                                    }}
                                >
                                    We want to keep the score fair!
                                </Text>
                                <Text style={{ color: 'white' }}>
                                    Check back to this screen when Green Up week
                                    starts to tag your bags!
                                </Text>
                            </SafeAreaView>
                        </Fragment>
                    )
                ],
                [
                    R.T,
                    () => (
                        <SafeAreaView
                            style={{
                                borderTopWidth: 1,
                                borderStyle: 'solid',
                                borderColor: 'white',
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'flex-end'
                            }}
                        >
                            <ScrollView style={{ flexGrow: 1, padding: 20 }}>
                                {R.cond([
                                    [
                                        () => teamCount > 1,
                                        () => (
                                            <Fragment>
                                                <Text style={styles.label}>
                                                    {'This drop is for team:'}
                                                </Text>
                                                <View
                                                    style={{
                                                        backgroundColor:
                                                            'white',
                                                        padding: 2.5
                                                    }}
                                                >
                                                    <Picker
                                                        selectedValue={
                                                            drop.teamId
                                                        }
                                                        onValueChange={(
                                                            pvalue
                                                        ) =>
                                                            setDrop({
                                                                ...drop,
                                                                teamId: pvalue
                                                            })
                                                        }
                                                        mode="dialog"
                                                    >
                                                        {Object.entries(
                                                            allAssignedTeams
                                                        ).map(
                                                            ([
                                                                townId,
                                                                townEntry
                                                            ]) => (
                                                                <Picker.Item
                                                                    key={townId}
                                                                    label={
                                                                        townEntry.name
                                                                    }
                                                                    value={
                                                                        townId
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </Picker>
                                                </View>
                                            </Fragment>
                                        )
                                    ],
                                    [
                                        () => teamCount === 1,
                                        () => (
                                            <Fragment>
                                                <Text style={styles.label}>
                                                    {'This drop is for team:'}
                                                </Text>
                                                <View
                                                    style={{
                                                        backgroundColor:
                                                            'white',
                                                        padding: 20
                                                    }}
                                                >
                                                    <Text>
                                                        {' '}
                                                        {defaultTeam.name}{' '}
                                                    </Text>
                                                </View>
                                            </Fragment>
                                        )
                                    ],
                                    [R.T, () => null]
                                ])()}

                                <View
                                    style={{
                                        height: 100,
                                        marginTop: 20,
                                        marginBottom: 20
                                    }}
                                >
                                    <Text
                                        style={{
                                            lineHeight: 60,
                                            height: 60,
                                            color: 'white',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {'How many bags are you dropping?'}
                                    </Text>
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => {
                                                const bagCount = isNaN(
                                                    Number(drop.bagCount)
                                                )
                                                    ? 1
                                                    : Number(drop.bagCount) < 2
                                                      ? 1
                                                      : Number(drop.bagCount) -
                                                        1;
                                                setDrop({ ...drop, bagCount });
                                            }}
                                            style={{
                                                height: 100,
                                                marginRight: 10
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                size={40}
                                                style={{ color: '#EEE' }}
                                                name={'chevron-down-circle'}
                                            />
                                        </TouchableOpacity>
                                        <TextInput
                                            underlineColorAndroid="transparent"
                                            value={
                                                isNaN(drop.bagCount)
                                                    ? ''
                                                    : drop.bagCount.toString()
                                            }
                                            keyboardType="numeric"
                                            placeholder="#"
                                            style={{
                                                color: '#000',
                                                width: 80,
                                                textAlign: 'center',
                                                backgroundColor: 'white',
                                                fontSize: 20
                                            }}
                                            onChangeText={(text: string) => {
                                                const bagCount = isNaN(
                                                    Number(text)
                                                )
                                                    ? 1
                                                    : Number(text);
                                                setDrop({ ...drop, bagCount });
                                            }}
                                        />
                                        <TouchableOpacity
                                            onPress={() => {
                                                const bagCount = isNaN(
                                                    Number(drop.bagCount)
                                                )
                                                    ? 1
                                                    : Number(drop.bagCount) < 1
                                                      ? 1
                                                      : Number(drop.bagCount) +
                                                        1;
                                                setDrop({
                                                    ...drop,
                                                    bagCount
                                                });
                                            }}
                                            style={{
                                                height: 100,
                                                marginLeft: 10
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                size={40}
                                                style={{ color: '#EEE' }}
                                                name={'chevron-up-circle'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={styles.label}>Other Items</Text>
                                <TagToggle
                                    tag={'bio-waste'}
                                    text={'Needles/Bio-Waste'}
                                    drop={drop}
                                    style={{
                                        margin: 0,
                                        paddingTop: 20,
                                        paddingBottom: 0
                                    }}
                                    onToggle={toggleTag('bio-waste')}
                                />
                                <TagToggle
                                    tag={'tires'}
                                    text={'Tires'}
                                    drop={drop}
                                    style={{ margin: 0, padding: 0 }}
                                    onToggle={toggleTag('tires')}
                                />
                                <TagToggle
                                    tag={'large'}
                                    text={'Large Object'}
                                    drop={drop}
                                    style={{
                                        margin: 0,
                                        paddingBottom: 20,
                                        paddingTop: 0
                                    }}
                                    onToggle={toggleTag('large')}
                                />

                                <TownInformation
                                    townInfo={currentTown}
                                    hideOnError={true}
                                />

                                <LineDivider
                                    style={{ marginTop: 20, marginBottom: 20 }}
                                />

                                {getDropButtons() as any}

                                {R.cond([
                                    [
                                        R.always(
                                            Boolean(drop.collectionSiteId)
                                        ),
                                        () => (
                                            <View
                                                style={{
                                                    backgroundColor: 'white',
                                                    padding: 10,
                                                    marginTop: 10
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 20,
                                                        marginBottom: 10
                                                    }}
                                                >
                                                    {
                                                        "I'm taking my trash here:"
                                                    }
                                                </Text>
                                                <Site
                                                    site={selectedSite}
                                                    town={currentTown}
                                                />
                                            </View>
                                        )
                                    ],
                                    [
                                        () => Boolean(userLocation?.error),
                                        () => (
                                            <EnableLocationServices
                                                errorMessage={
                                                    userLocation.error
                                                }
                                            />
                                        )
                                    ],
                                    [
                                        () => !Boolean(initialMapLocation),
                                        () => (
                                            <View
                                                style={[
                                                    styles.frame,
                                                    {
                                                        display: 'flex',
                                                        justifyContent: 'center'
                                                    }
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
                                            <MiniMap
                                                initialLocation={{
                                                    ...(
                                                        userLocation || {
                                                            coordinates: {
                                                                latitude: 0.0,
                                                                longitude: 0.0
                                                            }
                                                        }
                                                    ).coordinates,
                                                    latitudeDelta: 0.0922,
                                                    longitudeDelta: 0.0421
                                                }}
                                                pinsConfig={[
                                                    {
                                                        ...drop,
                                                        coordinates:
                                                            drop.location
                                                                ?.coordinates,
                                                        title: 'Drop Here',
                                                        description: `${drop.bagCount} bag${
                                                            drop.bagCount > 1
                                                                ? 's'
                                                                : ''
                                                        }`
                                                    }
                                                ]}
                                                onMapClick={clickOnMap}
                                                refKey={refKey}
                                                style={{
                                                    flex: 1,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    alignSelf: 'stretch',
                                                    marginTop: 20
                                                }}
                                            />
                                        )
                                    ]
                                ])()}

                                <View style={{ height: 100 }} />
                            </ScrollView>
                            <ButtonBar buttonConfigs={btnConfig} />
                        </SafeAreaView>
                    )
                ]
            ])()}
            <Modal
                animationType={'slide'}
                onRequestClose={() => {
                    setModal(null);
                }}
                transparent={false}
                visible={modal === 'site-selector'}
            >
                <SafeAreaView>
                    <SiteSelector
                        onSelect={(site: any) => {
                            setDrop({
                                ...drop,
                                collectionSiteId: site.id,
                                location: null
                            });
                            setModal(null);
                        }}
                        sites={sitesArray}
                        userLocation={userLocation || {}}
                        towns={Object.values(townData)}
                        close={() => {
                            setModal(null);
                        }}
                        value={selectedSite}
                    />
                </SafeAreaView>
            </Modal>
        </Fragment>
    );
};
