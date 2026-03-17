import * as R from 'ramda';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '@/constants/colors';
import { isInTeam, isValidEmail } from '@/libs/validators';
import TeamMember from '@/models/team-member';
import * as constants from '@/styles/constants';
import { defaultStyles } from '@/styles/default-styles';
import { FontAwesome } from '@expo/vector-icons';
import { ButtonBar } from '../button-bar/button-bar';

import { selectUser } from '@/store/slices/loginSlice';
import {
    inviteContacts as inviteContactsThunk,
    retrieveContact as retrieveContactThunk,
    selectContacts,
    selectSelectedTeam,
    selectTeamMembers
} from '@/store/slices/teamsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const myStyles = {};
const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles as any);

interface ContactType {
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
}

function getDisplayName(contact: ContactType): string {
    return contact.firstName || contact.lastName
        ? `${contact.firstName || ''} ${contact.lastName || ''} (${contact.email || ''})`.trim()
        : contact.email || '';
}

interface InviteContactsProps {
    closeModal?: () => void;
}

const InviteContacts: React.FC<InviteContactsProps> = ({ closeModal }) => {
    const dispatch = useAppDispatch();

    const currentUser = useAppSelector(selectUser) || {};
    const selectedTeam = useAppSelector(selectSelectedTeam);
    const teamMembers = useAppSelector(selectTeamMembers);
    const contacts = useAppSelector(selectContacts) as ContactType[];

    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

    useEffect(() => {
        dispatch(retrieveContactThunk({} as any) as any);
    }, [dispatch]);

    const isSelected = (email?: string) =>
        selectedContacts.includes(email || '');

    const inviteToTeam = () => {
        const _teamMembers = contacts
            .filter((contact: ContactType) => isSelected(contact.email))
            .map((contact: ContactType) =>
                TeamMember.create(
                    Object.assign({}, contact, {
                        displayName: `${contact.firstName || ''} ${contact.lastName || ''}`,
                        memberStatus: TeamMember.memberStatuses.INVITED
                    })
                )
            );
        closeModal?.();
        dispatch(
            inviteContactsThunk({
                team: selectedTeam,
                user: currentUser,
                teamMembers: _teamMembers
            }) as any
        );
    };

    const toggleContact = (email?: string) => () => {
        const newContacts = isSelected(email)
            ? R.filter((_email: string) => _email !== email)(selectedContacts)
            : selectedContacts.concat(email || '');
        setSelectedContacts(newContacts);
    };

    const filterSortContacts = (myContacts: ContactType[]) =>
        (myContacts || [])
            .filter(
                (contact: ContactType) =>
                    isValidEmail(contact.email || '') &&
                    !isInTeam(
                        selectedTeam?.id
                            ? teamMembers[selectedTeam.id] || {}
                            : {},
                        contact.email
                    )
            )
            .sort((a: ContactType, b: ContactType) => {
                const bDisplay =
                    `${b.firstName || ''}${b.lastName || ''}${b.email || ''}`.toLowerCase();
                const aDisplay =
                    `${a.firstName || ''}${a.lastName || ''}${a.email || ''}`.toLowerCase();
                if (aDisplay < bDisplay) return -1;
                if (aDisplay > bDisplay) return 1;
                return 0;
            });

    const renderRow = (contact: ContactType) => (
        <TouchableOpacity onPress={toggleContact(contact.email)}>
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderColor: '#AAA',
                    backgroundColor: colors.white,
                    padding: 20
                }}
            >
                <View
                    style={{
                        width: 40,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <FontAwesome
                        size={30}
                        name={
                            isSelected(contact.email)
                                ? 'envelope'
                                : 'plus-square'
                        }
                    />
                </View>
                <Text style={{ fontSize: 20, marginLeft: 10 }}>
                    {getDisplayName(contact)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const headerButtons = [
        { text: 'Invite to Team', onClick: inviteToTeam },
        ...(closeModal ? [{ text: 'Close', onClick: closeModal }] : [])
    ];

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: constants.colorBackgroundDark }
            ]}
        >
            <ButtonBar buttonConfigs={headerButtons} />
            <View
                style={{
                    flex: 1,
                    backgroundColor: constants.colorBackgroundLight
                }}
            >
                <FlatList
                    style={{ backgroundColor: '#FFFFFF' }}
                    data={filterSortContacts(contacts)}
                    renderItem={({ item }) => renderRow(item)}
                />
            </View>
        </SafeAreaView>
    );
};

export default InviteContacts;
