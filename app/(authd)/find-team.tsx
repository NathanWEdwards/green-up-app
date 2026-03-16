import { MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import {
    getTeams,
    selectAllTeams,
    selectTeam,
    selectTeamMembers
} from '@/store/slices/teamsSlice';
import { selectTownData } from '@/store/slices/townsSlice';
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
    }
};
const combinedStyles = { ...defaultStyles, ...myStyles };
const styles = StyleSheet.create(combinedStyles as any);

interface SearchResult {
    teamId: string;
    toDetail: () => void;
    team: Team;
}

export default function FindTeam() {
    const dispatch = useAppDispatch();

    const teams = useAppSelector(selectAllTeams);
    const teamMembers = useAppSelector(selectTeamMembers);
    const currentUser = useAppSelector(selectUser);
    const towns = useAppSelector(selectTownData) || {};
    const userLocation = useAppSelector(selectUserLocation);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [hasResults, setHasResults] = useState(false);
    const [hasTeams, setHasTeams] = useState(false);

    useEffect(() => {
        dispatch(getTeams());
        setHasTeams(Object.keys(teams).length > 0);
    }, [dispatch]);

    const mkey = currentUser?.uid;

    const myTeamKeys = useMemo(() => {
        const teamKeys = Object.keys(teams);
        return teamKeys.filter((key: string) => {
            const members = teamMembers[key];
            if (!members || !members[mkey]) return false;
            const status = members[mkey].memberStatus;
            return (
                status === teamMemberStatuses.OWNER ||
                status === teamMemberStatuses.ACCEPTED
            );
        });
    }, [teams, teamMembers, mkey]);

    const notMyTeams = useMemo(() => {
        const teamKeys = Object.keys(teams);
        const filtered = teamKeys.filter(
            (key: string) => !myTeamKeys.includes(key)
        );
        const unique = Array.from(new Set(filtered));
        return unique.map((key) => teams[key]);
    }, [teams, myTeamKeys]);

    const toTeamDetail = (teamId: string) => () => {
        dispatch(selectTeam(teams[teamId]));
        router.push('/(authd)/team-details' as any);
    };

    const searchableFields = ['name', 'description', 'townId'];

    useEffect(() => {
        const teamsFound = searchArray(
            searchableFields,
            notMyTeams,
            searchTerm
        );
        const results: SearchResult[] = teamsFound.map((team: any) => ({
            teamId: team.id,
            toDetail: toTeamDetail(team.id),
            team
        }));
        setSearchResults(results);
        setHasTeams(results.length > 0);
    }, [searchTerm, notMyTeams]);

    const TeamItem = ({ item }: { item: SearchResult }) => (
        <TouchableOpacity key={item.team.id} onPress={item.toDetail}>
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderColor: '#AAA',
                    paddingTop: 10,
                    paddingBottom: 10
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        width: 40,
                        maxWidth: 40,
                        marginRight: 20,
                        marginLeft: 10
                    }}
                >
                    <MaterialCommunityIcons
                        name={item.team.isPublic ? 'earth' : 'earth-off'}
                        size={40}
                    />
                </View>

                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        padding: 10,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <View>
                        <Text
                            style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#111',
                                fontSize: 16,
                                fontFamily: 'Rubik-Regular'
                            }}
                        >
                            {item.team.name || ''}
                        </Text>
                    </View>
                    <View>
                        <Text
                            style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#111',
                                fontSize: 12,
                                fontFamily: 'Rubik-Regular'
                            }}
                        >
                            {(towns[item.team.townId as string] || ({} as any))
                                .name || ''}
                        </Text>
                    </View>
                </View>
                <View>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            marginLeft: 20,
                            marginRight: 10
                        }}
                    >
                        <SimpleLineIcons
                            name="arrow-right"
                            size={20}
                            color="#333"
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <WatchGeoLocation />
            <SearchBar
                searchTerm={searchTerm}
                search={setSearchTerm}
                userLocation={userLocation}
            />
            {hasTeams ? (
                <View
                    style={{
                        flex: 1,
                        backgroundColor: constants.colorBackgroundLight
                    }}
                >
                    <FlatList
                        style={{ backgroundColor: colors.backgroundLight }}
                        data={searchResults}
                        renderItem={({ item }) => <TeamItem item={item} />}
                        keyExtractor={(item) => item.teamId}
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
