import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { skipToken } from '@reduxjs/toolkit/query/react';

import { TextDivider } from '@/components/divider';
import { Caption } from '@/components/text';
import {
    useAddTeamMemberMutation,
    useGetTeamRequestsQuery,
    useRemoveTeamRequestMutation
} from '@/store/apis/teamApi';
import { selectSelectedTeam } from '@/store/slices/teamsSlice';
import { useAppSelector } from '@/store/hooks';
import * as constants from '@/styles/constants';

const anonymousImage = require('@/assets/images/anonymous.png');

const styles = StyleSheet.create({
    requestsWrapper: {
        width: '100%',
        paddingVertical: 8
    },
    requestCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
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
        fontWeight: '600',
        color: '#222',
        fontFamily: 'Rubik-Regular'
    },
    requestEmail: {
        fontSize: 12,
        color: '#888',
        marginTop: 2
    },
    requestActions: {
        flexDirection: 'row',
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
        fontWeight: '600',
        fontSize: 13
    },
    declineButtonText: {
        color: '#555',
        fontWeight: '600',
        fontSize: 13
    },
    badgeContainer: {
        backgroundColor: constants.colorButton,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginLeft: 8
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700'
    },
    emptyRequestsContainer: {
        backgroundColor: constants.colorBackgroundDark
    },
    emptyRequestsText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 16
    },
    dividerBg: {
        backgroundColor: '#FFFFFFAA'
    }
});

interface MembershipRequestsProps {
    teamId: string;
    isOwner: boolean;
}

const MembershipRequests: React.FC<MembershipRequestsProps> = ({
    teamId,
    isOwner
}) => {
    const selectedTeam = useAppSelector(selectSelectedTeam);
    const [addTeamMemberTrigger] = useAddTeamMemberMutation();
    const [removeTeamRequestTrigger] = useRemoveTeamRequestMutation();

    const { data: teamRequests } = useGetTeamRequestsQuery(
        isOwner && teamId ? teamId : skipToken,
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

    if (!isOwner) {
        return null;
    }

    const handleAccept = (request: any) => {
        const uid = request.uid || request.id;
        setDismissedRequests((prev) => new Set([...prev, uid]));
        addTeamMemberTrigger({
            teamId,
            user: request,
            status: 'ACCEPTED'
        });
        if (selectedTeam) {
            removeTeamRequestTrigger({
                team: selectedTeam,
                user: request
            });
        }
    };

    const handleDecline = (request: any) => {
        const uid = request.uid || request.id;
        setDismissedRequests((prev) => new Set([...prev, uid]));
        if (selectedTeam) {
            removeTeamRequestTrigger({
                team: selectedTeam,
                user: request
            });
        }
    };

    return (
        <>
            <TextDivider style={styles.dividerBg}>
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
            <View style={styles.requestsWrapper}>
                {filteredRequests.length === 0 ? (
                    <View style={styles.emptyRequestsContainer}>
                        <Text style={styles.emptyRequestsText}>
                            No pending join requests
                        </Text>
                    </View>
                ) : (
                    filteredRequests.map((request: any, i: number) => (
                        <View key={request.uid || i} style={styles.requestCard}>
                            <Image
                                style={styles.requestAvatar}
                                source={{
                                    uri: request.photoURL || anonymousImage
                                }}
                            />
                            <View style={styles.requestInfo}>
                                <Text style={styles.requestName}>
                                    {request.displayName ||
                                        request.email ||
                                        'Unknown'}
                                </Text>
                                {request.email && (
                                    <Text style={styles.requestEmail}>
                                        {request.email}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.requestActions}>
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => handleAccept(request)}
                                >
                                    <Text style={styles.acceptButtonText}>
                                        Accept
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.declineButton}
                                    onPress={() => handleDecline(request)}
                                >
                                    <Text style={styles.declineButtonText}>
                                        Decline
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </>
    );
};

export default MembershipRequests;
