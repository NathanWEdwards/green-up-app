import { MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DisplayText from '@/components/display-text';
import SearchBar from '@/components/search-bar';
import WatchGeoLocation from '@/components/watch-geo-location';
import colors from '@/constants/colors';
import * as teamMemberStatuses from '@/constants/team-member-statuses';
import { searchArray } from '@/libs/search';
import type Team from '@/models/team';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/loginSlice';
import { selectTeam } from '@/store/slices/teamsSlice';
import {
    useGetAssignedTeamsQuery,
    useGetTeamsQuery
} from '@/store/apis/teamApi';
import { useGetAllTownsQuery } from '@/store/apis/townApi';
import { selectUserLocation } from '@/store/slices/userLocationSlice';
import * as constants from '@/styles/constants';
import { defaultStyles } from '@/styles/default-styles';

const myStyles = {
    details: {
        fontWeight: 'bold' as const
    },
    noTeamsFound: {
        flex: 1,
        justifyContent: 'center' as const
    },
    noTeamsFoundWrapper: {
        backgroundColor: '#FFFFFF44',
        width: '100%' as const,
        padding: 20
    },
    noTeamsFoundText: {
        fontSize: 30,
        color: constants.colorTextThemeLight,
        textShadowColor: `${constants.colorTextThemeDark}`,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
        lineHeight: 36
    },
    teamDetail: {
        color: constants.colorTextThemeLight,
        fontSize: 14
    },
    teamItemRow: {
        flex: 1,
        flexDirection: 'row' as const,
        borderBottomWidth: 1,
        borderColor: '#AAA',
        paddingTop: 10,
        paddingBottom: 10
    },
    teamItemIconWrapper: {
        flex: 1,
        justifyContent: 'center' as const,
        width: 40,
        maxWidth: 40,
        marginRight: 20,
        marginLeft: 10
    },
    teamItemCenter: {
        flex: 1,
        flexDirection: 'column' as const,
        padding: 10,
        justifyContent: 'center' as const,
        alignItems: 'center' as const
    },
    teamItemName: {
        textAlign: 'center' as const,
        fontWeight: 'bold' as const,
        color: '#111',
        fontSize: 16,
        fontFamily: 'Rubik-Regular'
    },
    teamItemTown: {
        textAlign: 'center' as const,
        fontWeight: 'bold' as const,
        color: '#111',
        fontSize: 12,
        fontFamily: 'Rubik-Regular'
    },
    teamItemArrowWrapper: {
        flex: 1,
        justifyContent: 'center' as const,
        marginLeft: 20,
        marginRight: 10
    },
    listWrapper: {
        flex: 1,
        backgroundColor: constants.colorBackgroundLight
    }
};
const combinedStyles = { ...defaultStyles, ...myStyles };
const styles = StyleSheet.create(combinedStyles as any);

interface SearchResult {
    teamId: string;
    toDetail: () => void;
    team: Team;
}

const searchableFields = ['name', 'description', 'townId'];

const TeamItem = React.memo(
    ({ item, towns }: { item: SearchResult; towns: Record<string, any> }) => (
        <TouchableOpacity key={item.team.id} onPress={item.toDetail}>
            <View style={styles.teamItemRow}>
                <View style={styles.teamItemIconWrapper}>
                    <MaterialCommunityIcons
                        name={item.team.isPublic ? 'earth' : 'earth-off'}
                        size={40}
                    />
                </View>

                <View style={styles.teamItemCenter}>
                    <View>
                        <Text style={styles.teamItemName}>
                            {item.team.name || ''}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.teamItemTown}>
                            {(towns[item.team.townId as string] || ({} as any))
                                .name || ''}
                        </Text>
                    </View>
                </View>
                <View>
                    <View style={styles.teamItemArrowWrapper}>
                        <SimpleLineIcons
                            name="arrow-right"
                            size={20}
                            color="#333"
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
);

TeamItem.displayName = 'TeamItem';

export default function FindTeam() {
    const dispatch = useAppDispatch();

    const { data: teams } = useGetTeamsQuery(undefined, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });
    const currentUser = useAppSelector(selectUser);
    const { data: assignedTeams } = useGetAssignedTeamsQuery(currentUser.uid, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });
    const { data: towns } = useGetAllTownsQuery(undefined, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });
    const userLocation = useAppSelector(selectUserLocation);

    const [searchTerm, setSearchTerm] = useState('');

    const mkey = currentUser?.uid;

    const myTeamKeys = useMemo(() => {
        const teamKeys = Object.keys(teams);
        return teamKeys.filter((key: string) => {
            const members: any = assignedTeams[key];
            if (!members || !members[mkey]) return false;
            const status = members[mkey].memberStatus;
            return (
                status === teamMemberStatuses.OWNER ||
                status === teamMemberStatuses.ACCEPTED
            );
        });
    }, [teams, assignedTeams, mkey]);

    const searchableTeams = useMemo(() => {
        return Object.values(teams);
    }, [teams]);

    const toTeamDetail = useCallback(
        (teamId: string) => () => {
            dispatch(selectTeam(teams[teamId]));
            router.push('/(authd)/team-details' as any);
        },
        [dispatch, teams]
    );

    const searchResults = useMemo(() => {
        const teamsFound = searchArray(
            searchableFields,
            searchableTeams,
            searchTerm
        );
        return teamsFound.map((team: any) => ({
            teamId: team.id,
            toDetail: toTeamDetail(team.id),
            team
        }));
    }, [searchTerm, searchableTeams, toTeamDetail]);

    const hasTeams = searchResults.length > 0;

    const renderItem = useCallback(
        ({ item }: { item: SearchResult }) => (
            <TeamItem item={item} towns={towns} />
        ),
        [towns]
    );

    const keyExtractor = useCallback((item: SearchResult) => item.teamId, []);

    return (
        <SafeAreaView style={styles.container}>
            <WatchGeoLocation />
            <SearchBar
                searchTerm={searchTerm}
                search={setSearchTerm}
                userLocation={userLocation}
            />
            {hasTeams ? (
                <View style={styles.listWrapper}>
                    <FlatList
                        style={{ backgroundColor: colors.backgroundLight }}
                        data={searchResults}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                    />
                </View>
            ) : (
                <View style={styles.noTeamsFound}>
                    <View style={styles.noTeamsFoundWrapper}>
                        <DisplayText style={styles.noTeamsFoundText}>
                            {"Sorry, we couldn't find any teams for you."}
                        </DisplayText>
                        <DisplayText
                            style={{
                                ...styles.noTeamsFoundText,
                                marginTop: 10
                            }}
                        >
                            {'Try starting your own!'}
                        </DisplayText>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
