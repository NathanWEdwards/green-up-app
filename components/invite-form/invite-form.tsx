import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { removeNulls } from '@/libs/remove-nulls';
import { isInTeam, isValidEmail } from '@/libs/validators';
import TeamMember from '@/models/team-member';
import User from '@/models/user';
import * as constants from '@/styles/constants';
import { defaultStyles } from '@/styles/default-styles';
import { ButtonBar } from '../button-bar/button-bar';
import TextInput from '../inputs';
import { Text } from '../text';

import { selectUser } from '@/store/slices/loginSlice';
import { selectProfile } from '@/store/slices/profileSlice';
import {
    inviteContacts as inviteContactsThunk,
    selectSelectedTeam,
    selectTeamMembers
} from '@/store/slices/teamsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const myStyles = {};
const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles as any);

interface InviteFormProps {
    closeModal?: () => void;
}

const InviteForm: React.FC<InviteFormProps> = ({ closeModal }) => {
    const dispatch = useAppDispatch();

    const loginUser = useAppSelector(selectUser) || {};
    const profile = useAppSelector(selectProfile) || {};
    const currentUser = User.create({ ...loginUser, ...removeNulls(profile) });
    const selectedTeam = useAppSelector(selectSelectedTeam);
    const teamMembers = useAppSelector(selectTeamMembers);

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const inviteToTeam = () => {
        const displayName = `${firstName} ${lastName}`;
        const teamMember = TeamMember.create({
            firstName,
            lastName,
            email,
            displayName,
            memberStatus: TeamMember.memberStatuses.INVITED
        });
        const myTeamMembers = selectedTeam?.id ? teamMembers[selectedTeam.id] || {} : {};
        const emailIsInvalid =
            !isValidEmail(email) || isInTeam(myTeamMembers, email);

        if (emailIsInvalid) {
            Alert.alert('Please enter a valid email address');
        } else {
            dispatch(
                inviteContactsThunk({
                    team: selectedTeam,
                    user: currentUser,
                    teamMembers: [teamMember]
                }) as any
            );
            setFirstName('');
            setLastName('');
            setEmail('');
        }
    };

    const myTeamMembers = selectedTeam?.id ? teamMembers[selectedTeam.id] || {} : {};
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
            <ScrollView
                style={[styles.scroll, { padding: 20 }]}
                automaticallyAdjustContentInsets={false}
                scrollEventThrottle={200}
                keyboardShouldPersistTaps="always"
            >
                <View style={styles.formControl}>
                    <Text style={styles.label}>{"Invitee's Email"}</Text>
                    <TextInput
                        autoCapitalize="none"
                        style={styles.textInput}
                        placeholder="john@example.com"
                        value={email || ''}
                        onChangeText={setEmail}
                        underlineColorAndroid="transparent"
                    />
                    <Text>
                        {isInTeam(myTeamMembers, email)
                            ? 'That person is already on the team'
                            : ' '}
                    </Text>
                </View>
                <View style={styles.formControl}>
                    <Text style={styles.label}>{'First Name'}</Text>
                    <TextInput
                        style={styles.textInput}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First"
                        underlineColorAndroid="transparent"
                    />
                </View>
                <View style={styles.formControl}>
                    <Text style={styles.label}>{'Last Name'}</Text>
                    <TextInput
                        style={styles.textInput}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last"
                        underlineColorAndroid="transparent"
                    />
                </View>
            </ScrollView>
            <ButtonBar buttonConfigs={headerButtons} />
        </SafeAreaView>
    );
};

export default InviteForm;
