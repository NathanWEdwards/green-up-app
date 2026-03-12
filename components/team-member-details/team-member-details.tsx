import {
    ButtonBar,
    ButtonConfigType
} from '@/components/button-bar/button-bar';
import MemberIcon from '@/components/member-icon';
import * as status from '@/constants/team-member-statuses';
import { defaultGravatar } from '@/libs/avatars';
import * as constants from '@/styles/constants';
import { defaultStyles } from '@/styles/default-styles';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const myStyles = {
    statusBar: {
        flex: 1,
        flexDirection: 'row' as const,
        justifyContent: 'flex-start' as const,
        alignItems: 'center' as const,
        backgroundColor: '#FFE',
        marginBottom: 10,
        marginTop: 15,
        padding: 10,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderColor: '#AAA'
    },
    statusBarText: { fontSize: 12, textAlign: 'left' as const }
};

const combinedStyles = { ...defaultStyles, ...myStyles };
const styles = StyleSheet.create(combinedStyles as any);

interface TeamMemberData {
    memberStatus?: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    bio?: string;
}

interface TeamData {
    id?: string;
    name?: string;
}

interface TeamMemberDetailsProps {
    addTeamMember: () => void;
    closeModal: () => void;
    team?: TeamData;
    revokeInvitation: () => void;
    removeTeamMember: () => void;
    teamMember: TeamMemberData;
}

const TeamMemberDetails: React.FC<TeamMemberDetailsProps> = ({
    addTeamMember,
    closeModal,
    team,
    revokeInvitation,
    removeTeamMember,
    teamMember
}) => {
    const addAnotherTeamMember = () => {
        closeModal();
        addTeamMember();
    };

    const unInvite = () => {
        Alert.alert(
            'DANGER!',
            'Are you sure you want to revoke this invitation?',
            [
                {
                    text: 'No',
                    onPress: () => {
                        closeModal();
                    },
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        closeModal();
                        revokeInvitation();
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const removeThisTeamMember = () => {
        Alert.alert(
            'DANGER!',
            'Are you sure you want to remove this team member?',
            [
                {
                    text: 'No',
                    onPress: () => {},
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        closeModal();
                        removeTeamMember();
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const getButtons = (
        _team: TeamData | undefined,
        _teamMember: TeamMemberData,
        closeMembersModal: () => void
    ): ButtonConfigType[] => {
        switch (_teamMember.memberStatus) {
            case status.REQUEST_TO_JOIN:
                return [
                    { text: 'Ignore', onClick: removeThisTeamMember },
                    {
                        text: 'Add',
                        onClick: addAnotherTeamMember
                    },
                    { text: 'Close', onClick: closeMembersModal }
                ];
            case status.ACCEPTED:
                return [
                    { text: 'Remove', onClick: removeThisTeamMember },
                    {
                        text: 'Close',
                        onClick: closeMembersModal
                    }
                ];
            case status.INVITED:
                return [
                    { text: 'Revoke Invitation', onClick: unInvite },
                    {
                        text: 'Close',
                        onClick: closeMembersModal
                    }
                ];
            default:
                return [{ text: 'Close', onClick: closeMembersModal }];
        }
    };

    const getStatus = (_teamMember: TeamMemberData): React.ReactElement => {
        switch (_teamMember.memberStatus) {
            case status.OWNER:
                return (
                    <View style={styles.statusBar}>
                        <MemberIcon memberStatus={status.OWNER} />
                        <View>
                            <Text style={styles.statusBarText}>
                                {`${(_teamMember.displayName && _teamMember.displayName.trim()) || _teamMember.email} is  the owner of this team`}
                            </Text>
                        </View>
                    </View>
                );
            case status.REQUEST_TO_JOIN:
                return (
                    <View style={styles.statusBar}>
                        <MemberIcon
                            memberStatus={status.REQUEST_TO_JOIN}
                            isOwner={
                                (_teamMember.memberStatus as string) ===
                                status.OWNER
                            }
                        />
                        <View>
                            <Text style={styles.statusBarText}>
                                {`${(_teamMember.displayName && _teamMember.displayName.trim()) || _teamMember.email} wants to join this team`}
                            </Text>
                        </View>
                    </View>
                );
            case status.ACCEPTED:
                return (
                    <View style={styles.statusBar}>
                        <MemberIcon memberStatus={status.ACCEPTED} />
                        <View>
                            <Text style={styles.statusBarText}>
                                {`${(_teamMember.displayName && _teamMember.displayName.trim()) || _teamMember.email} is a member of this team.`}
                            </Text>
                        </View>
                    </View>
                );
            case status.INVITED:
                return (
                    <View style={styles.statusBar}>
                        <MemberIcon memberStatus={status.INVITED} />
                        <View>
                            <Text style={styles.statusBarText}>
                                {`${(_teamMember.displayName && _teamMember.displayName.trim()) || _teamMember.email} has not yet accepted the invitation`}
                            </Text>
                        </View>
                    </View>
                );

            default:
                return (
                    <View style={styles.statusBar}>
                        <MemberIcon memberStatus={status.NOT_INVITED} />
                        <View>
                            <Text style={styles.statusBarText}>
                                {`${(_teamMember.displayName && _teamMember.displayName.trim()) || _teamMember.email || 'This person'} is not a member of this team`}
                            </Text>
                        </View>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: constants.colorBackgroundDark }
            ]}
        >
            <ButtonBar
                buttonConfigs={getButtons(team, teamMember, closeModal)}
            />
            <ScrollView
                style={{ padding: 0, margin: 0 }}
                automaticallyAdjustContentInsets={false}
                scrollEventThrottle={200}
                keyboardShouldPersistTaps={'always'}
            >
                {getStatus(teamMember)}

                <View style={styles.profileHeader}>
                    <Image
                        style={{ width: 50, height: 50, margin: 5 }}
                        source={{ uri: teamMember.photoURL || defaultGravatar }}
                    />
                    <Text style={[styles.profileName, styles.heading]}>
                        {`${(teamMember.displayName && teamMember.displayName.trim()) || teamMember.email || ''}`}
                    </Text>
                </View>

                <View style={{ marginTop: 10 }}>
                    <Text style={styles.label}>{teamMember.bio || ''}</Text>
                </View>
            </ScrollView>
            <ButtonBar
                buttonConfigs={getButtons(team, teamMember, closeModal)}
            />
        </SafeAreaView>
    );
};

export default TeamMemberDetails;
