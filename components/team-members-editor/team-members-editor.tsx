import React, { useMemo, useState } from 'react';
import {
    SectionList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { skipToken } from '@reduxjs/toolkit/query/react';

import { Caption } from '@/components/text';
import MemberIcon from '@/components/member-icon';
import Loader from '@/components/loader';
import MembershipRequests from '@/components/membership-requests';
import TeamMemberDetails from '@/components/team-member-details';
import { getGravatar } from '@/models/user';
import User from '@/models/user';
import * as constants from '@/styles/constants';
import { defaultStyles } from '@/styles/default-styles';
import { SimpleLineIcons } from '@expo/vector-icons';
import { ButtonBar } from '../button-bar/button-bar';
import InviteContacts from '../invite-contacts';
import InviteForm from '../invite-form';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/loginSlice';
import { selectProfile } from '@/store/slices/profileSlice';
import { selectSelectedTeam } from '@/store/slices/teamsSlice';
import {
    useAddTeamMemberMutation,
    useGetTeamInvitationsQuery,
    useGetTeamMembersQuery,
    useRemoveTeamMemberMutation,
    useRevokeTeamInvitationMutation,
    useUpdateTeamMemberMutation
} from '@/store/apis/teamApi';

const myStyles = {
    member: {
        flex: 1,
        flexDirection: 'row' as const,
        justifyContent: 'flex-start' as const
    },
    memberEmail: {
        marginLeft: 10,
        lineHeight: 25
    },
    memberName: {
        marginLeft: 35,
        paddingBottom: 5,
        fontSize: 10,
        lineHeight: 10
    },
    item: {
        borderBottomWidth: 1,
        borderBottomColor: '#888',
        marginBottom: 0,
        backgroundColor: '#EEE'
    }
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles as any);

interface MemberItemProps {
    item: any;
}

const MemberItem: React.FC<MemberItemProps> = ({ item }) => (
    <TouchableOpacity key={item.id} onPress={item.toDetail}>
        <View
            style={{
                flex: 1,
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderColor: '#AAA',
                backgroundColor: '#FFF'
            }}
        >
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 40,
                    maxWidth: 40,
                    marginLeft: 10
                }}
            >
                <MemberIcon
                    memberStatus={item.memberStatus}
                    isOwner={item.isOwner}
                />
            </View>
            <Image
                style={{ width: 80, height: 80 }}
                source={{ uri: item.photoURL || getGravatar(item.email) }}
            />
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    padding: 10,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Text
                    style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#111',
                        fontSize: 16,
                        fontFamily: 'Rubik-Regular'
                    }}
                >
                    {(item.displayName && item.displayName.trim()) ||
                        item.email ||
                        ''}
                </Text>
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

const TeamMembersEditor: React.FC = () => {
    const [addTeamMemberTrigger] = useAddTeamMemberMutation();
    const [updateTeamMemberTrigger] = useUpdateTeamMemberMutation();
    const [removeTeamMemberTrigger] = useRemoveTeamMemberMutation();
    const [revokeInvitationTrigger] = useRevokeTeamInvitationMutation();

    const loginUser = useAppSelector(selectUser) || {};
    const profile = useAppSelector(selectProfile) || {};
    const currentUser = useMemo(
        () => User.create({ ...loginUser, ...profile }),
        [loginUser, profile]
    );
    const selectedTeam = useAppSelector(selectSelectedTeam);

    const { data: teamMembers } = useGetTeamMembersQuery(
        selectedTeam?.id ?? skipToken,
        {
            selectFromResult: (result) => ({
                ...result,
                data: result.data ?? {}
            })
        }
    );

    const { data: teamInvitations } = useGetTeamInvitationsQuery(
        selectedTeam?.id ?? skipToken,
        {
            selectFromResult: (result) => ({
                ...result,
                data: result.data ?? {}
            })
        }
    );

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(
        <Text>Loading...</Text>
    );

    if (!selectedTeam || !selectedTeam.id) {
        return <Loader message="Loading team members..." />;
    }

    const isOwner = selectedTeam.owner?.uid === currentUser.uid;

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const inviteContacts = () => {
        setIsModalVisible(true);
        setModalContent(<InviteContacts closeModal={closeModal} />);
    };

    const inviteForm = () => {
        setIsModalVisible(true);
        setModalContent(<InviteForm closeModal={closeModal} />);
    };

    const toMemberDetails = (member: any) => {
        const removeTeamMember = () =>
            removeTeamMemberTrigger({
                teamId: selectedTeam.id!,
                teamMember: member
            }) as any;

        const revokeInvitation = () =>
            revokeInvitationTrigger({
                teamId: selectedTeam.id!,
                uid: member.email
            }) as any;

        const updateTeamMember = () =>
            updateTeamMemberTrigger({
                teamId: selectedTeam.id!,
                teamMember: member
            }) as any;

        const addTeamMember = () =>
            addTeamMemberTrigger({
                teamId: selectedTeam.id!,
                user: member,
                status: 'member'
            });

        return () => {
            setModalContent(
                <TeamMemberDetails
                    closeModal={closeModal}
                    addTeamMember={addTeamMember}
                    removeTeamMember={removeTeamMember}
                    revokeInvitation={revokeInvitation}
                    teamMember={member}
                />
            );
            setIsModalVisible(true);
        };
    };

    const memberData = useMemo(() => {
        return Object.values(teamMembers).map((member: any, i: number) => ({
            key: i.toString(),
            ...member,
            isOwner: selectedTeam!.owner?.uid === member.uid,
            toDetail: toMemberDetails(member)
        }));
    }, [teamMembers, teamInvitations, selectedTeam]);

    const invitatinData = useMemo(() => {
        return Object.values(teamInvitations).map((member: any, i: number) => ({
            key: i.toString(),
            ...member,
            isOwner: selectedTeam!.owner?.uid === member.uid,
            toDetail: toMemberDetails(member)
        }));
    }, [teamInvitations, selectedTeam]);

    const sections = [
        {
            title: 'Members',
            data: memberData
        },
        {
            title: 'Invitations',
            data: invitatinData
        }
    ];

    debugger;

    const headerButtons = [
        { text: 'Invite A Friend', onClick: inviteForm },
        { text: 'Add From Contacts', onClick: inviteContacts }
    ];

    const listHeader = isOwner ? (
        <MembershipRequests teamId={selectedTeam.id!} isOwner={isOwner} />
    ) : null;

    return (
        <View style={{ flex: 1 }}>
            <ButtonBar buttonConfigs={headerButtons} />
            <View
                style={{
                    flex: 1,
                    backgroundColor: constants.colorBackgroundLight
                }}
            >
                <SectionList
                    sections={sections}
                    renderItem={({ item }) => <MemberItem item={item} />}
                    ListHeaderComponent={listHeader}
                    stickySectionHeadersEnabled={true}
                    renderSectionHeader={({ section }) => (
                        <Caption>{section.title}</Caption>
                    )}
                />
            </View>
            <Modal
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
                transparent={false}
                visible={isModalVisible}
            >
                <View style={{ flex: 1 }}>{modalContent}</View>
            </Modal>
        </View>
    );
};

export default TeamMembersEditor;
