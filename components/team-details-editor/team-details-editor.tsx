import { useRouter } from 'expo-router';
import * as R from 'ramda';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';

import { LineDivider } from '@/components/divider';
import * as statuses from '@/constants/team-member-statuses';
import { removeNulls } from '@/libs/remove-nulls';
import TeamMember from '@/models/team-member';
import User from '@/models/user';
import * as colors from '@/styles/constants';
import { defaultStyles } from '@/styles/default-styles';
import TeamDetailsForm from '../team-details-form';

import { selectUser } from '@/store/slices/loginSlice';
import { selectProfile } from '@/store/slices/profileSlice';
import { setSelectedTeam, selectSelectedTeam } from '@/store/slices/teamsSlice';
import {
    useDeleteTeamMutation,
    useGetTeamsQuery,
    useSaveTeamMutation
} from '@/store/apis/teamApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { serify, defaultOptions } from '@karmaniverous/serify-deserify';
import { sanitize } from '@/libs/serify';

const myStyles = {
    danger: {
        borderWidth: 2,
        borderColor: colors.colorTextError,
        marginTop: 10,
        padding: 10,
        backgroundColor: 'white'
    },
    dangerText: {
        color: colors.colorTextError,
        fontSize: 18,
        textAlign: 'center' as const
    },
    selected: {
        opacity: 0.5
    }
};
const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles as any);

const TeamDetailsEditor: React.FC = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [deleteTeamTrigger] = useDeleteTeamMutation();
    const [saveTeamTrigger] = useSaveTeamMutation();

    const loginUser = useAppSelector(selectUser) || {};
    const profile = useAppSelector(selectProfile) || {};
    const currentUser = User.create({ ...loginUser, ...removeNulls(profile) });
    const selectedTeam = useAppSelector(selectSelectedTeam);
    const { data: allTeams } = useGetTeamsQuery(undefined, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });
    const owner = TeamMember.create({
        ...currentUser,
        ...profile,
        memberStatus: statuses.OWNER
    });

    // Derive other clean areas
    const mapToPinData = (locations: any, teamName?: string): any => {
        if (!locations) return [];
        if (Array.isArray(locations)) {
            return locations
                .filter((l: any) => Boolean(l))
                .map((l: any) => mapToPinData(l, teamName));
        }
        return {
            key: '',
            coordinates: locations.coordinates,
            title: `${teamName || 'Another Team'}`,
            description: 'has claimed this area'
        };
    };

    const otherCleanAreas: any[] = R.compose(
        R.flatten,
        R.map((entry: [string, any]) =>
            mapToPinData(entry[1].locations, entry[1].name)
        ),
        R.filter((entry: [string, any]) => entry[0] !== selectedTeam?.id),
        Object.entries
    )(allTeams);

    const saveTeam = async (team: any) => {
        await saveTeamTrigger({ team }).unwrap();
        const serializable = serify(sanitize(team), defaultOptions);
        dispatch(setSelectedTeam(serializable));
        router.back();
    };

    const deleteTeam = () => {
        Alert.alert(
            'DANGER!',
            'Are you really, really sure you want to permanently delete this team?',
            [
                { text: 'No', onPress: () => {}, style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => {
                        router.back();
                        if (selectedTeam?.id) {
                            deleteTeamTrigger({ teamId: selectedTeam.id });
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    };

    return (
        <TeamDetailsForm
            currentUser={currentUser}
            onSave={saveTeam}
            otherCleanAreas={otherCleanAreas}
            team={selectedTeam as any}
        >
            <LineDivider />
            <View style={{ marginTop: 20, marginBottom: 40 }}>
                <TouchableHighlight style={styles.danger} onPress={deleteTeam}>
                    <Text style={styles.dangerText}>{'Delete Team'}</Text>
                </TouchableHighlight>
            </View>
        </TeamDetailsForm>
    );
};

export default TeamDetailsEditor;
