import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skipToken } from '@reduxjs/toolkit/query/react';

import { ButtonBar } from '@/components/button-bar/button-bar';
import { TextDivider } from '@/components/divider';
import { MemberIcon } from '@/components/member-icon/member-icon';
import { MiniMap } from '@/components/mini-map/mini-map';
import { Caption, Title } from '@/components/text';
import { TownItem } from '@/components/town-item/town-item';
import Loader from '@/components/loader/loader';
import ScrollIndicator from '@/components/scroll-indicator';
import * as teamMemberStatuses from '@/constants/team-member-statuses';
import User from '@/models/user';
import type Team from '@/models/team';
import { defaultStyles } from '@/styles/default-styles';
import { selectUser } from '@/store/slices/loginSlice';
import { selectProfile } from '@/store/slices/profileSlice';
import {
    selectMyInvitations,
    selectSelectedTeam
} from '@/store/slices/teamsSlice';
import {
    useAcceptTeamInvitationMutation,
    useAskToJoinTeamMutation,
    useGetAssignedTeamsQuery,
    useGetTeamMembersQuery,
    useJoinTeamMutation,
    useLeaveTeamMutation,
    useRemoveTeamRequestMutation,
    useRevokeTeamInvitationMutation
} from '@/store/apis/teamApi';
import { useGetAllTownsQuery } from '@/store/apis/townApi';
import { useAppSelector } from '@/store/hooks';

const myStyles = {
    memberStatusBanner: {
        paddingTop: 5,
        paddingBottom: 5
    },
    memberStatusMessage: {
        color: 'white' as const
    },
    membership: {
        flex: 1,
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const
    },
    teamMember: {
        height: 30,
        marginTop: 15
    },
    text: {
        color: 'black' as const,
        fontSize: 20,
        fontFamily: 'Rubik-Regular'
    },

    infoWrapper: {
        width: '100%' as const,
        backgroundColor: 'white',
        padding: 20
    },
    noLocationText: {
        fontSize: 14,
        textAlign: 'left' as const,
        padding: 20,
        backgroundColor: 'white',
        color: 'black'
    },
    memberListTitle: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center' as const,
        marginTop: 10
    },
    memberRow: {
        borderStyle: 'solid' as const,
        borderWidth: 1,
        backgroundColor: 'white',
        width: '100%' as const,
        height: 52,
        marginTop: 5
    },
    memberAvatar: {
        width: 50,
        height: 50,
        marginRight: 10
    },
    memberIconStyle: {
        marginTop: 10,
        marginRight: 5
    },
    dividerBg: {
        backgroundColor: '#FFFFFFAA'
    },
    blockBorder: {
        borderTopWidth: 1,
        borderBottomWidth: 0,
        borderTopColor: 'rgba(255,255,255,0.2)'
    },

    memberListWrapper: {
        width: '100%' as const
    }
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles as any);

const TeamDetailsScreen: React.FC = () => {
    const router = useRouter();
    const [acceptInvitationTrigger] = useAcceptTeamInvitationMutation();
    const [askToJoinTeam] = useAskToJoinTeamMutation();
    const [joinTeamTrigger] = useJoinTeamMutation();
    const [leaveTeamTrigger] = useLeaveTeamMutation();
    const [revokeInvitationTrigger] = useRevokeTeamInvitationMutation();
    const [removeTeamRequestTrigger] = useRemoveTeamRequestMutation();

    const loginUser = useAppSelector(selectUser);
    const profile = useAppSelector(selectProfile);
    const currentUser = useMemo(
        () => User.create({ ...loginUser, ...profile }),
        [loginUser, profile]
    );
    const selectedTeam = useAppSelector(selectSelectedTeam);
    const { data: assignedTeams } = useGetAssignedTeamsQuery(currentUser.uid!, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });

    const { data: teamMembers } = useGetTeamMembersQuery(
        selectedTeam?.id ?? skipToken,
        {
            selectFromResult: (result) => ({
                ...result,
                data: result.data ?? {}
            })
        }
    );

    const invitations = useAppSelector(selectMyInvitations);
    const { data: townData } = useGetAllTownsQuery(undefined, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });

    const town = useMemo(() => {
        const selectedTownName = (selectedTeam?.town || '').toLowerCase();
        return Object.values(townData || {}).find(
            (_town: any) =>
                (_town.name || '').toLowerCase() === selectedTownName
        );
    }, [selectedTeam?.town, townData]);

    const [indicatorVisible, setIndicatorVisible] = useState(false);

    const handleScroll = useCallback((event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } =
            event.nativeEvent;
        const padding = 100;
        if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - padding
        ) {
            setIndicatorVisible(false);
        } else {
            setIndicatorVisible(true);
        }
    }, []);

    // Show loading state while selectedTeam is being set
    if (!selectedTeam || !selectedTeam.id) {
        return <Loader message="Loading team details…" />;
    }

    const declineInvitation = (teamId: string, uid: string) => {
        revokeInvitationTrigger({ teamId, uid });
    };

    const acceptInvitation = (teamId: string, user: any) => {
        acceptInvitationTrigger({ teamId, user });
    };

    const leaveTeam = (teamId: string, user: any) => {
        Alert.alert(
            'DANGER!',
            'Are you really, really sure you want to leave this team?',
            [
                { text: 'No', onPress: () => {}, style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => {
                        router.back();
                        leaveTeamTrigger({ teamId, user });
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const removeRequest = (team: Team, user: User) => {
        removeTeamRequestTrigger({ user, team });
        router.back();
    };

    const askToJoin = (team: Team, user: User) => {
        askToJoinTeam({ team, user });
        router.push('/(authd)/' as any);
    };

    const joinTeam = (team: any, user: any) => {
        joinTeamTrigger({ team, user });
        router.push('/(authd)/' as any);
    };

    const toMemberDetails = (teamId: string, membershipId: string) => {
        // TODO: implement team member details route
    };

    const memberKey = currentUser.uid;
    const hasInvitation = Boolean(invitations[selectedTeam.id]);

    const getTeamMemberStatus = (): string => {
        switch (true) {
            case hasInvitation:
                return teamMemberStatuses.INVITED;
            case (assignedTeams[selectedTeam.id!] || {}).isMember === false:
                return teamMemberStatuses.REQUEST_TO_JOIN;
            case (teamMembers[memberKey!] || {}).memberStatus ===
                teamMemberStatuses.OWNER:
                return teamMemberStatuses.OWNER;
            case (teamMembers[memberKey!] || {}).memberStatus ===
                teamMemberStatuses.ACCEPTED:
                return teamMemberStatuses.ACCEPTED;
            default:
                return teamMemberStatuses.NOT_INVITED;
        }
    };

    const memberStatus = getTeamMemberStatus();
    const isTeamMember =
        memberStatus === teamMemberStatuses.OWNER ||
        memberStatus === teamMemberStatuses.ACCEPTED;

    const headerButtons = () => {
        switch (true) {
            case memberStatus === teamMemberStatuses.INVITED:
                return [
                    {
                        text: 'Accept Invitation',
                        onClick: () =>
                            acceptInvitation(selectedTeam.id!, currentUser)
                    },
                    {
                        text: 'Decline Invitation',
                        onClick: () =>
                            declineInvitation(
                                selectedTeam.id!,
                                currentUser.email || ''
                            )
                    }
                ];
            case selectedTeam.owner?.uid === currentUser.uid:
                return [
                    {
                        text: 'Edit Team',
                        onClick: () => router.push('/(authd)/team-editor')
                    }
                ];
            case memberStatus === teamMemberStatuses.ACCEPTED:
                return [
                    {
                        text: 'Leave Team',
                        onClick: () => leaveTeam(selectedTeam.id!, currentUser)
                    }
                ];
            case memberStatus === teamMemberStatuses.REQUEST_TO_JOIN:
                return [
                    {
                        text: 'Remove Request',
                        onClick: () => removeRequest(selectedTeam, currentUser)
                    }
                ];
            case selectedTeam.isPublic:
                return [
                    {
                        text: 'Join this team',
                        onClick: () => joinTeam(selectedTeam, currentUser)
                    }
                ];
            default:
                return [
                    {
                        text: 'Ask to join this team',
                        onClick: () => askToJoin(selectedTeam, currentUser)
                    }
                ];
        }
    };

    const getMemberStatus = (): React.ReactElement | null => {
        switch (true) {
            case memberStatus === teamMemberStatuses.INVITED:
                return (
                    <View style={styles.membership}>
                        <MemberIcon
                            memberStatus={teamMemberStatuses.INVITED}
                            size={20}
                        />
                        <Text style={styles.memberStatusMessage}>
                            {'You have been invited to this team'}
                        </Text>
                    </View>
                );
            case selectedTeam.owner?.uid === currentUser.uid:
                return (
                    <View style={styles.membership}>
                        <MemberIcon
                            memberStatus={teamMemberStatuses.OWNER}
                            size={20}
                        />
                        <Text style={styles.memberStatusMessage}>
                            {'You are the owner of this team'}
                        </Text>
                    </View>
                );
            case memberStatus === teamMemberStatuses.ACCEPTED:
                return (
                    <View style={styles.membership}>
                        <MemberIcon
                            memberStatus={teamMemberStatuses.ACCEPTED}
                            size={20}
                        />
                        <Text style={styles.memberStatusMessage}>
                            {'You are a member of this team.'}
                        </Text>
                    </View>
                );
            case memberStatus === teamMemberStatuses.REQUEST_TO_JOIN:
                return (
                    <View style={styles.membership}>
                        <MemberIcon
                            memberStatus={teamMemberStatuses.REQUEST_TO_JOIN}
                            size={20}
                        />
                        <Text style={styles.memberStatusMessage}>
                            {'Waiting on owner approval'}
                        </Text>
                    </View>
                );
            default:
                return null;
        }
    };

    const pinsConfig = () =>
        (selectedTeam.locations || []).map((l: any) => ({
            coordinates: l.coordinates,
            title: selectedTeam.name,
            description: 'team cleaning area',
            color: 'orange'
        }));

    const initialLocation = selectedTeam.locations![0].coordinates;

    return (
        <SafeAreaView style={styles.container}>
            <ButtonBar buttonConfigs={headerButtons()} />
            <ScrollView
                onScroll={handleScroll}
                style={[styles.scroll, { padding: 20 }]}
            >
                <Title>{selectedTeam.name}</Title>
                {getMemberStatus()}
                <TextDivider style={styles.dividerBg}>
                    <Caption>{'DETAILS'}</Caption>
                </TextDivider>
                <View style={styles.infoWrapper}>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{'Owner: '}</Text>
                        <Text style={styles.text}>
                            {selectedTeam.owner?.displayName}
                        </Text>
                    </Text>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{'Where: '}</Text>
                        <Text style={styles.text}>
                            {`${selectedTeam.location || ''}${
                                !selectedTeam.location || !selectedTeam.town
                                    ? ''
                                    : ', '
                            }${selectedTeam.town || ''}`}
                        </Text>
                    </Text>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{'Date: '}</Text>
                        <Text style={styles.text}>{selectedTeam.date}</Text>
                    </Text>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{'Starts: '}</Text>
                        <Text style={styles.text}>
                            {selectedTeam.startdate}
                        </Text>
                    </Text>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{'Ends: '}</Text>
                        <Text style={styles.text}>{selectedTeam.end}</Text>
                    </Text>
                    {!selectedTeam.description ? null : (
                        <Text style={styles.dataBlock}>
                            <Text style={styles.text}>{'Information: '}</Text>
                            <Text style={styles.text}>
                                {selectedTeam.description}
                            </Text>
                        </Text>
                    )}
                </View>

                <TextDivider style={styles.dividerBg}>
                    <Caption>{'CLEANING LOCATION'}</Caption>
                </TextDivider>

                {initialLocation ? (
                    <MiniMap
                        initialLocation={initialLocation}
                        pinsConfig={pinsConfig()}
                    />
                ) : (
                    <Text style={styles.noLocationText}>
                        {
                            'The team owner has yet to designate a clean up location.'
                        }
                    </Text>
                )}
                {town ? (
                    <View style={styles.block}>
                        <TownItem item={town} />
                    </View>
                ) : null}
                <View style={[styles.block, styles.blockBorder]}>
                    {isTeamMember ? (
                        <View style={styles.memberListWrapper}>
                            <Text style={styles.memberListTitle}>
                                {'Team Members'}
                            </Text>
                            {Object.values(teamMembers).map(
                                (member: any, i: number) => (
                                    <TouchableHighlight
                                        key={i}
                                        style={styles.memberRow}
                                        onPress={() =>
                                            toMemberDetails(
                                                selectedTeam.id!,
                                                member.uid
                                            )
                                        }
                                    >
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row'
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row'
                                                }}
                                            >
                                                <Image
                                                    style={styles.memberAvatar}
                                                    source={{
                                                        uri: member.photoURL
                                                    }}
                                                />
                                                <Text style={styles.teamMember}>
                                                    {member.displayName ||
                                                        member.email}
                                                </Text>
                                            </View>
                                            <MemberIcon
                                                memberStatus={
                                                    member.memberStatus
                                                }
                                                style={styles.memberIconStyle}
                                            />
                                        </View>
                                    </TouchableHighlight>
                                )
                            )}
                        </View>
                    ) : null}
                </View>
            </ScrollView>
            {indicatorVisible && <ScrollIndicator />}
        </SafeAreaView>
    );
};

export default TeamDetailsScreen;
