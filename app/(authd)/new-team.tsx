import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import * as R from 'ramda';
import React, { useMemo, useReducer } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonBar } from '@/components/button-bar/button-bar';
import { PrimaryButton, SecondaryButton } from '@/components/button/button';
import LineDivider from '@/components/divider/line-divider';
import MiniMap from '@/components/mini-map';
import colors from '@/constants/colors';
import * as statuses from '@/constants/team-member-statuses';
import { findTownIdByCoordinates } from '@/libs/geo-helpers';
import { getCurrentGreenUpDay } from '@/libs/green-up-day-calculators';
import { removeNulls } from '@/libs/remove-nulls';
import Team from '@/models/team';
import TeamMember from '@/models/team-member';
import User from '@/models/user';
import { selectUser } from '@/store/slices/loginSlice';
import { selectProfile } from '@/store/slices/profileSlice';
import { createTeam, selectAllTeams } from '@/store/slices/teamsSlice';
import { defaultStyles } from '@/styles/default-styles';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const myStyles = {
    selected: {
        opacity: 0.65
    },
    publicButton: {
        width: '50%' as const,
        backgroundColor: colors.white
    },
    publicText: {
        fontSize: 12,
        color: '#555'
    },
    privateButton: {
        width: '50%' as const,
        backgroundColor: colors.backgroundDark
    },
    privateText: {
        fontSize: 12,
        color: 'white',
        opacity: 0.5
    }
};

const styles = StyleSheet.create({ ...defaultStyles, ...myStyles } as any);
const dateRangeMessage = `${moment(getCurrentGreenUpDay()).utc().format('dddd, MMM Do YYYY')} is the next Green Up Day, but teams may choose to work up to one week before or after.`;

interface LocalState {
    team: any;
    startDateTimePickerVisible: boolean;
    endDateTimePickerVisible: boolean;
    datePickerVisible: boolean;
    query: string;
    townId: string;
    locations: any[];
    date: Date;
    initialMapLocation: any;
}

const freshState = (
    owner: any,
    initialMapLocation: any = null
): LocalState => ({
    team: Team.create({
        owner,
        date: getCurrentGreenUpDay(),
        startdate: '9am',
        end: '5pm'
    } as any),
    startDateTimePickerVisible: false,
    endDateTimePickerVisible: false,
    datePickerVisible: false,
    query: '',
    townId: '',
    locations: [],
    date: getCurrentGreenUpDay(),
    initialMapLocation
});

interface LocalAction {
    type: 'SET_STATE' | 'SET_TEAM_STATE' | 'RESET_STATE';
    data: any;
}

function localReducer(state: LocalState, action: LocalAction): LocalState {
    switch (action.type) {
        case 'SET_STATE':
            return { ...state, ...action.data };
        case 'SET_TEAM_STATE':
            return { ...state, team: { ...state.team, ...action.data } };
        case 'RESET_STATE':
            return action.data;
        default:
            throw new Error('Invalid action type');
    }
}

const NewTeam: React.FC = () => {
    const dispatch = useAppDispatch();

    const loginUser = useAppSelector(selectUser);
    const profile = useAppSelector(selectProfile);
    const allTeams = useAppSelector(selectAllTeams) || {};

    const currentUser = useMemo(
        () => User.create({ ...loginUser, ...removeNulls(profile) }),
        [loginUser, profile]
    );

    const owner = useMemo(
        () =>
            TeamMember.create({
                ...currentUser,
                ...profile,
                memberStatus: statuses.OWNER
            }),
        [currentUser, profile]
    );

    const mapToPinData = (locations: any, teamName?: any): any[] => {
        if (!locations) return [];
        if (Array.isArray(locations)) {
            return (locations || [])
                .filter((l: any): boolean => Boolean(l))
                .map((l: any): any => mapToPinData(l, teamName));
        }
        return [
            {
                key: '',
                coordinates: locations.coordinates,
                title: `${teamName || 'Another Team'}`,
                description: 'has claimed this area'
            }
        ];
    };

    const otherCleanAreas = useMemo(
        () =>
            R.compose(
                R.flatten as any,
                R.map((team: any): any[] =>
                    mapToPinData(team.locations, team.name)
                ) as any,
                Object.values as any
            )(allTeams) as any[],
        [allTeams]
    );

    const [formState, formDispatch] = useReducer(
        localReducer,
        freshState(currentUser)
    );

    const handleMapClick = (coordinates: any) => {
        Keyboard.dismiss();
        const town = findTownIdByCoordinates(coordinates);
        formDispatch({
            type: 'SET_TEAM_STATE',
            data: {
                townId: town,
                locations: formState.team.locations.concat({
                    title: 'Clean Area',
                    description: formState.team.name,
                    townId: town,
                    coordinates
                })
            }
        });
    };

    const removeLastMarker = () => {
        const locations = formState.team.locations.slice(
            0,
            formState.team.locations.length - 1
        );
        formDispatch({ type: 'SET_TEAM_STATE', data: { locations } });
    };

    const removeMarker = (index: number) => {
        const myLocations = formState.team.locations || [];
        if (index < myLocations.length) {
            const locations = myLocations
                .slice(0, index)
                .concat(myLocations.slice(index + 1));
            formDispatch({ type: 'SET_TEAM_STATE', data: { locations } });
        }
    };

    const cancel = () => {
        formDispatch({ type: 'RESET_STATE', data: freshState(currentUser) });
    };

    const handleCreateTeam = () => {
        const team = Team.create({ ...formState.team });
        if (!team.name) {
            Alert.alert('Please give your team a name.');
        } else {
            dispatch(createTeam({ team, user: currentUser }) as any);
            router.back();
        }
    };

    const setTeamValue = (key: string) => (value: any) => {
        formDispatch({
            type: 'SET_TEAM_STATE',
            data: { [key]: value }
        });
    };

    const headerButtons = [
        { text: 'Save', onClick: handleCreateTeam },
        { text: 'Clear', onClick: cancel }
    ];

    const pinsConfig = (formState.team.locations || [])
        .map((l: any) => ({
            coordinates: l.coordinates,
            title: formState.team.name,
            description: 'Click here to remove pin',
            onCalloutPress: removeMarker,
            color: 'green'
        }))
        .concat(otherCleanAreas.map((o: any) => ({ ...o, color: 'yellow' })));

    return (
        <SafeAreaView style={styles.container}>
            <ButtonBar buttonConfigs={headerButtons} />

            <KeyboardAvoidingView
                keyboardVerticalOffset={100}
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <ScrollView
                        automaticallyAdjustContentInsets={false}
                        scrollEventThrottle={200}
                        style={{ paddingLeft: 20, paddingRight: 20 }}
                    >
                        <View style={styles.formControl}>
                            <Text style={styles.label}>{'Team Name'}</Text>
                            <TextInput
                                keyboardType="default"
                                onChangeText={setTeamValue('name')}
                                placeholder="Team Name"
                                value={formState.team.name}
                                underlineColorAndroid="transparent"
                            />
                        </View>

                        <View style={styles.formControl}>
                            <Text style={styles.label}>
                                {formState.team.isPublic
                                    ? 'Anyone can join your team'
                                    : 'You control who joins your team'}
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <PrimaryButton
                                    style={{
                                        ...(formState.team.isPublic
                                            ? styles.publicButton
                                            : styles.privateButton)
                                    }}
                                    onPress={() =>
                                        setTeamValue('isPublic')(true)
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name="earth"
                                        size={25}
                                        style={{ marginRight: 10 }}
                                        color={
                                            !formState.team.isPublic
                                                ? '#555'
                                                : 'black'
                                        }
                                    />
                                    <Text
                                        style={{
                                            ...(formState.team.isPublic
                                                ? styles.publicText
                                                : styles.privateText)
                                        }}
                                    >
                                        PUBLIC
                                    </Text>
                                </PrimaryButton>
                                <PrimaryButton
                                    style={{
                                        ...(formState.team.isPublic
                                            ? styles.privateButton
                                            : styles.publicButton)
                                    }}
                                    onPress={() =>
                                        setTeamValue('isPublic')(false)
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name="earth-off"
                                        size={25}
                                        style={{ marginRight: 10 }}
                                        color={
                                            formState.team.isPublic
                                                ? '#555'
                                                : 'black'
                                        }
                                    />
                                    <Text
                                        style={{
                                            ...(formState.team.isPublic
                                                ? styles.privateText
                                                : styles.publicText)
                                        }}
                                    >
                                        PRIVATE
                                    </Text>
                                </PrimaryButton>
                            </View>
                        </View>
                        <LineDivider
                            style={{ marginTop: 20, marginBottom: 20 }}
                        />
                        <View style={styles.formControl}>
                            <Text style={styles.label}>{'Clean Up Site'}</Text>
                            <TextInput
                                keyboardType="default"
                                onChangeText={setTeamValue('location')}
                                placeholder="The park, school, or road name"
                                value={formState.team.location}
                                style={{
                                    backgroundColor: 'white',
                                    padding: 20
                                }}
                                underlineColorAndroid="transparent"
                            />
                        </View>
                        <View style={styles.formControl}>
                            <Text style={{ ...styles.label, maxHeight: 63 }}>
                                {'Mark your spot(s)'}
                            </Text>
                            <MiniMap
                                pinsConfig={pinsConfig}
                                onMapClick={handleMapClick}
                            />
                            <SecondaryButton onPress={removeLastMarker}>
                                <Text style={{ color: 'white' }}>
                                    {'REMOVE MARKER'}
                                </Text>
                            </SecondaryButton>
                        </View>
                        <LineDivider
                            style={{ marginTop: 20, marginBottom: 20 }}
                        />
                        <View style={styles.formControl}>
                            <Text style={styles.alertInfo}>
                                {dateRangeMessage}
                            </Text>
                        </View>
                        <View style={styles.formControl}>
                            <View>
                                <Text style={styles.label}>
                                    {'Which day will your team be cleaning?'}
                                </Text>
                                <View>
                                    <TextInput
                                        style={styles.textInput}
                                        keyboardType="default"
                                        onChangeText={setTeamValue('date')}
                                        placeholder="Date for your Green Up event?"
                                        placeholderTextColor={
                                            colors.placeholderText
                                        }
                                        value={formState.team.date}
                                        underlineColorAndroid="transparent"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.formControl}>
                            <View>
                                <Text style={styles.label}>
                                    {
                                        'What time will your team start Greening Up?'
                                    }
                                </Text>
                                <View>
                                    <TextInput
                                        style={styles.textInput}
                                        keyboardType="default"
                                        onChangeText={setTeamValue('startdate')}
                                        placeholder="Start Time for your Green Up event"
                                        placeholderTextColor={
                                            colors.placeholderText
                                        }
                                        value={formState.team.startdate}
                                        underlineColorAndroid="transparent"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.formControl}>
                            <View>
                                <Text style={styles.label}>
                                    {
                                        'What time will your team stop Greening Up?'
                                    }
                                </Text>
                                <View>
                                    <TextInput
                                        style={styles.textInput}
                                        keyboardType="default"
                                        onChangeText={setTeamValue('end')}
                                        placeholder="End Time for your Green Up event"
                                        placeholderTextColor={
                                            colors.placeholderText
                                        }
                                        value={formState.team.end}
                                        underlineColorAndroid="transparent"
                                    />
                                </View>
                            </View>
                        </View>
                        <LineDivider
                            style={{ marginTop: 20, marginBottom: 20 }}
                        />
                        <View style={styles.formControl}>
                            <Text style={styles.label}>
                                {'Team Information'}
                            </Text>
                            <TextInput
                                keyboardType="default"
                                multiline={true}
                                numberOfLines={10}
                                textAlignVertical="top"
                                onChangeText={setTeamValue('description')}
                                placeholder="Add important information here"
                                style={styles.textArea}
                                value={formState.team.description}
                                underlineColorAndroid="transparent"
                            />
                        </View>
                    </ScrollView>
                    <View style={{ flex: 1 }} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default NewTeam;
