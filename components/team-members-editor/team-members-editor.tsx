import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MemberIcon from '@/components/member-icon';
import TeamMemberDetails from '@/components/team-member-details';
import { getGravatar } from '@/models/user';
import * as constants from '@/styles/constants';
import { defaultStyles } from '@/styles/default-styles';
import { SimpleLineIcons } from '@expo/vector-icons';
import { ButtonBar } from '../button-bar/button-bar';
import InviteContacts from '../invite-contacts';
import InviteForm from '../invite-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import {
    selectMyInvitations,
    selectSelectedTeam,
    selectTeamRequests
} from '@/store/slices/teamsSlice';
import {
    useAddTeamMemberMutation,
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
    const dispatch = useAppDispatch();
    const [addTeamMemberTrigger] = useAddTeamMemberMutation();
    const [updateTeamMemberTrigger] = useUpdateTeamMemberMutation();
    const [removeTeamMemberTrigger] = useRemoveTeamMemberMutation();
    const [revokeInvitationTrigger] = useRevokeTeamInvitationMutation();

    const team = (useAppSelector(selectSelectedTeam) || {}) as any;
    const { data: allTeamMembers } = useGetTeamMembersQuery(team.id, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });
    const allRequests = useAppSelector(selectTeamRequests);
    const allInvitations = useAppSelector(selectMyInvitations);

    const members = team?.id ? allTeamMembers[team.id] || {} : {};
    const requests = team?.id ? allRequests[team.id] || {} : {};
    const invitations = team?.id ? allInvitations[team.id] || {} : {};

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(
        <Text>Loading...</Text>
    );

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const inviteContacts = (myTeam: any) => () => {
        setIsModalVisible(true);
        setModalContent(<InviteContacts closeModal={closeModal} />);
    };

    const inviteForm = (myTeam: any) => () => {
        setIsModalVisible(true);
        setModalContent(<InviteForm closeModal={closeModal} />);
    };

    const toMemberDetails = (myTeam: any, member: any) => {
        const removeTeamMember = () =>
            removeTeamMemberTrigger({
                teamId: myTeam.id,
                teamMember: member
            }) as any;

        const revokeInvitation = () =>
            revokeInvitationTrigger({
                teamId: myTeam.id,
                uid: member.email
            }) as any;

        const updateTeamMember = () =>
            updateTeamMemberTrigger({
                teamId: myTeam.id,
                teamMember: member
            }) as any;

        const addTeamMember = () =>
            addTeamMemberTrigger({
                teamId: myTeam.id,
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

    const memberRowData = ([] as any[])
        .concat(
            Object.values(requests),
            Object.values(members),
            Object.values(invitations)
        )
        .map((member: any, i: number) => ({
            key: i.toString(),
            ...member,
            isOwner: (team.owner as any)?.uid === member.id,
            toDetail: toMemberDetails(team, member)
        }));

    const headerButtons = [
        { text: 'Invite A Friend', onClick: inviteForm(team) },
        { text: 'Add From Contacts', onClick: inviteContacts(team) }
    ];

    return (
        <View style={styles.frame}>
            <ButtonBar buttonConfigs={headerButtons} />
            <View
                style={{
                    flex: 1,
                    backgroundColor: constants.colorBackgroundLight
                }}
            >
                <FlatList
                    data={memberRowData}
                    renderItem={({ item }) => <MemberItem item={item} />}
                />
            </View>
            <Modal
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
                transparent={false}
                visible={isModalVisible}
            >
                {modalContent}
            </Modal>
        </View>
    );
};

export default TeamMembersEditor;
