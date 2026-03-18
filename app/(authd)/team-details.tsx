import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
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
    useAddTeamMemberMutation,
    useAskToJoinTeamMutation,
    useGetAssignedTeamsQuery,
    useGetTeamMembersQuery,
    useGetTeamRequestsQuery,
    useJoinTeamMutation,
    useLeaveTeamMutation,
    useRemoveTeamRequestMutation,
    useRevokeTeamInvitationMutation
} from '@/store/apis/teamApi';
import { useGetAllTownsQuery } from '@/store/apis/townApi';
import { useAppSelector } from '@/store/hooks';
import * as constants from '@/styles/constants';

const anonymousImage = require('@/assets/images/anonymous.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    requestCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        padding: 14,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4
    },
    requestAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        backgroundColor: '#eee'
    },
    requestInfo: {
        flex: 1
    },
    requestName: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: '#222',
        fontFamily: 'Rubik-Regular'
    },
    requestEmail: {
        fontSize: 12,
        color: '#888',
        marginTop: 2
    },
    requestActions: {
        flexDirection: 'row' as const,
        gap: 8
    },
    acceptButton: {
        backgroundColor: constants.colorBackgroundDark,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8
    },
    declineButton: {
        backgroundColor: '#ddd',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8
    },
    acceptButtonText: {
        color: '#fff',
        fontWeight: '600' as const,
        fontSize: 13
    },
    declineButtonText: {
        color: '#555',
        fontWeight: '600' as const,
        fontSize: 13
    },
    badgeContainer: {
        backgroundColor: constants.colorButton,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 6,
        marginLeft: 8
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700' as const
    },
    emptyRequestsText: {
        color: '#999',
        fontSize: 14,
        textAlign: 'center' as const,
        paddingVertical: 16
    }
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles as any);

const TeamDetailsScreen: React.FC = () => {
    const router = useRouter();
    const [acceptInvitationTrigger] = useAcceptTeamInvitationMutation();
    const [addTeamMemberTrigger] = useAddTeamMemberMutation();
    const [askToJoinTeam] = useAskToJoinTeamMutation();
    const [joinTeamTrigger] = useJoinTeamMutation();
    const [leaveTeamTrigger] = useLeaveTeamMutation();
    const [removeTeamRequestTrigger] = useRemoveTeamRequestMutation();
    const [revokeInvitationTrigger] = useRevokeTeamInvitationMutation();

    const loginUser = useAppSelector(selectUser) || {};
    const profile = useAppSelector(selectProfile) || {};
    const currentUser = User.create({ ...loginUser, ...profile });
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

    const isOwner = selectedTeam?.owner?.uid === currentUser.uid;

    const { data: teamRequests } = useGetTeamRequestsQuery(
        isOwner && selectedTeam?.id ? selectedTeam.id : skipToken,
        {
            selectFromResult: (result) => ({
                ...result,
                data: result.data ?? {}
            })
        }
    );

    const [dismissedRequests, setDismissedRequests] = useState<Set<string>>(
        new Set()
    );
    const filteredRequests = useMemo(
        () =>
            Object.values(teamRequests).filter(
                (r: any) => !dismissedRequests.has(r.uid || r.id)
            ),
        [teamRequests, dismissedRequests]
    );

    const invitations = useAppSelector(selectMyInvitations);
    const { data: townData } = useGetAllTownsQuery(undefined, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });

    const selectedTownName = (selectedTeam?.town || '').toLowerCase();
    const town = Object.values(townData || {}).find(
        (_town: any) => (_town.name || '').toLowerCase() === selectedTownName
    );

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

    const teamMemberList = (
        <View style={{ width: '100%' }}>
            <Text
                style={{
                    fontSize: 20,
                    color: 'white',
                    textAlign: 'center',
                    marginTop: 10
                }}
            >
                {'Team Members'}
            </Text>
            {Object.values(teamMembers).map((member: any, i: number) => (
                <TouchableHighlight
                    key={i}
                    style={{
                        borderStyle: 'solid',
                        borderWidth: 1,
                        backgroundColor: 'white',
                        width: '100%',
                        height: 52,
                        marginTop: 5
                    }}
                    onPress={() =>
                        toMemberDetails(selectedTeam.id!, member.uid)
                    }
                >
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Image
                                style={{
                                    width: 50,
                                    height: 50,
                                    marginRight: 10
                                }}
                                source={{ uri: member.photoURL }}
                            />
                            <Text style={styles.teamMember}>
                                {member.displayName || member.email}
                            </Text>
                        </View>
                        <MemberIcon
                            memberStatus={member.memberStatus}
                            style={{ marginTop: 10, marginRight: 5 }}
                        />
                    </View>
                </TouchableHighlight>
            ))}
        </View>
    );

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
                return [];
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

    return (
        <SafeAreaView style={styles.container}>
            <ButtonBar buttonConfigs={headerButtons()} />
            <ScrollView style={[styles.scroll, { padding: 20 }]}>
                <Title>{selectedTeam.name}</Title>
                {getMemberStatus()}
                <TextDivider style={{ backgroundColor: '#FFFFFFAA' }}>
                    <Caption>{'INFORMATION'}</Caption>
                </TextDivider>
                <View
                    style={{
                        width: '100%',
                        backgroundColor: 'white',
                        padding: 20
                    }}
                >
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
                        <Text style={styles.text}>{selectedTeam.start}</Text>
                    </Text>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{'Ends: '}</Text>
                        <Text style={styles.text}>{selectedTeam.end}</Text>
                    </Text>
                    {!selectedTeam.notes ? null : (
                        <Text style={styles.dataBlock}>
                            <Text style={styles.text}>{'Description: '}</Text>
                            <Text>{selectedTeam.notes}</Text>
                        </Text>
                    )}
                </View>

                <TextDivider style={{ backgroundColor: '#FFFFFFAA' }}>
                    <Caption>{'CLEANING LOCATION'}</Caption>
                </TextDivider>

                {(selectedTeam.locations || []).length > 0 ? (
                    <MiniMap
                        initialLocation={{
                            ...selectedTeam.locations![0].coordinates,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421
                        }}
                        pinsConfig={selectedTeam.locations!.map((l: any) => ({
                            coordinates: l.coordinates,
                            title: selectedTeam.name,
                            description: 'team cleaning area',
                            color: 'orange'
                        }))}
                    />
                ) : (
                    <Text
                        style={{
                            fontSize: 14,
                            textAlign: 'left',
                            padding: 20,
                            backgroundColor: 'white',
                            color: 'black'
                        }}
                    >
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
                <View
                    style={[
                        styles.block,
                        {
                            borderTopWidth: 1,
                            borderBottomWidth: 0,
                            borderTopColor: 'rgba(255,255,255,0.2)'
                        }
                    ]}
                >
                    {isTeamMember ? teamMemberList : null}
                </View>

                {isOwner && (
                    <>
                        <TextDivider style={{ backgroundColor: '#FFFFFFAA' }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <Caption>{'MEMBERSHIP REQUESTS'}</Caption>
                                {filteredRequests.length > 0 && (
                                    <View style={styles.badgeContainer}>
                                        <Text style={styles.badgeText}>
                                            {filteredRequests.length}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TextDivider>
                        <View style={{ width: '100%', paddingVertical: 8 }}>
                            {filteredRequests.length === 0 ? (
                                <Text style={styles.emptyRequestsText}>
                                    No pending join requests
                                </Text>
                            ) : (
                                filteredRequests.map(
                                    (request: any, i: number) => (
                                        <View
                                            key={request.uid || i}
                                            style={styles.requestCard}
                                        >
                                            <Image
                                                style={styles.requestAvatar}
                                                source={{
                                                    uri:
                                                        request.photoURL ||
                                                        anonymousImage
                                                }}
                                            />
                                            <View style={styles.requestInfo}>
                                                <Text
                                                    style={styles.requestName}
                                                >
                                                    {request.displayName ||
                                                        request.email ||
                                                        'Unknown'}
                                                </Text>
                                                {request.email && (
                                                    <Text
                                                        style={
                                                            styles.requestEmail
                                                        }
                                                    >
                                                        {request.email}
                                                    </Text>
                                                )}
                                            </View>
                                            <View style={styles.requestActions}>
                                                <TouchableOpacity
                                                    style={styles.acceptButton}
                                                    onPress={() => {
                                                        const uid =
                                                            request.uid ||
                                                            request.id;
                                                        setDismissedRequests(
                                                            (prev) =>
                                                                new Set([
                                                                    ...prev,
                                                                    uid
                                                                ])
                                                        );
                                                        addTeamMemberTrigger({
                                                            teamId: selectedTeam.id!,
                                                            user: request,
                                                            status: 'ACCEPTED'
                                                        });
                                                        removeTeamRequestTrigger(
                                                            {
                                                                team: selectedTeam,
                                                                user: request
                                                            }
                                                        );
                                                    }}
                                                >
                                                    <Text
                                                        style={
                                                            styles.acceptButtonText
                                                        }
                                                    >
                                                        Accept
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.declineButton}
                                                    onPress={() => {
                                                        const uid =
                                                            request.uid ||
                                                            request.id;
                                                        setDismissedRequests(
                                                            (prev) =>
                                                                new Set([
                                                                    ...prev,
                                                                    uid
                                                                ])
                                                        );
                                                        removeTeamRequestTrigger(
                                                            {
                                                                team: selectedTeam,
                                                                user: request
                                                            }
                                                        );
                                                    }}
                                                >
                                                    <Text
                                                        style={
                                                            styles.declineButtonText
                                                        }
                                                    >
                                                        Decline
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                                )
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default TeamDetailsScreen;
