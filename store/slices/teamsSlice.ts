import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as Contacts from 'expo-contacts';
import { serify, defaultOptions } from '@karmaniverous/serify-deserify';

import * as types from '@/constants/action-types';
import * as firebaseDataLayer from '@/data-sources/firebase-data-layer';
import Contact from '@/models/contact';
import Invitation from '@/models/invitation';
import Team from '@/models/team';
import TeamMember from '@/models/team-member';

export interface TeamsState {
    teams: Record<string, Team>;
    teamMembers: Record<string, TeamMember>;
    selectedTeam: Team | null;
    assignedTeams: Record<string, any>;
    myInvitations: Record<string, Invitation>;
    teamRequests: Record<string, TeamMember>;
    contacts: Contact[];
}

const initialState: TeamsState = {
    assignedTeams: {},
    teams: {},
    teamMembers: {},
    selectedTeam: null,
    myInvitations: {},
    teamRequests: {},
    contacts: []
};

export const retrieveContact = createAsyncThunk(
    'teams/retrieveContacts',
    async (pageSize: number = 40, { dispatch }) => {
        // recursively get all contacts
        async function getContactsAsync(
            pageSize: number,
            pageOffset: number = 0
        ): Promise<any> {
            const data = await Contacts.getContactsAsync({
                fields: [
                    Contacts.Fields.PhoneNumbers,
                    Contacts.Fields.Emails,
                    Contacts.Fields.PhoneticFirstName,
                    Contacts.Fields.PhoneticLastName
                ],
                pageSize,
                pageOffset
            });
            const contacts = data.data.map(
                (contact: Contacts.Contact): Contact => Contact.create(contact)
            );
            dispatch({
                type: types.RETRIEVE_CONTACTS_SUCCESS,
                payload: contacts
            });
            return data.hasNextPage
                ? contacts.concat(
                      await getContactsAsync(pageSize, pageOffset + pageSize)
                  )
                : contacts;
        }

        // Ask for permission to query contacts.
        try {
            const permission = await Contacts.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                // Permission was denied...
                dispatch({
                    type: types.RETRIEVE_CONTACTS_FAIL,
                    error: 'User has not granted permission to access contacts'
                });
            } else {
                // we have permission lets start getting contacts
                await getContactsAsync(pageSize);
            }
        } catch (error: any) {
            dispatch({
                type: types.RETRIEVE_CONTACTS_FAIL,
                payload: error.message || 'Failed to retrieve contacts'
            });
        }
    }
);

export const selectTeam = createAsyncThunk(
    'teams/selectTeam',
    async (value: any, { rejectWithValue }) => {
        try {
            const team = serify(value, defaultOptions);
            const teamMembers = serify(
                await firebaseDataLayer.getTeamMembers(value.id),
                defaultOptions
            );
            return { team, teamMembers };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to select team');
        }
    }
);

export const setSelectedTeam = createAsyncThunk(
    'teams/setSelectedTeam',
    async (args: any, { dispatch }) => {
        const { key, value } = args;
        return {
            type: types.SET_SELECTED_TEAM_VALUE,
            data: { key, value }
        };
    }
);

export const deleteMessage = createAsyncThunk(
    'teams/deleteMessage',
    async (args: any, { rejectWithValue }) => {
        try {
            const { userId, messageId } = args;
            await firebaseDataLayer.deleteMessage(userId, messageId);
            return messageId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete message');
        }
    }
);

const teamsSlice = createSlice({
    name: 'teams',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(selectTeam.fulfilled, (state, action) => {
                const { team, teamMembers } = action.payload;
                state.selectedTeam = team as Team;
                state.teamMembers = teamMembers as Record<string, TeamMember>;
            })
            .addCase(types.FETCH_MY_TEAMS_SUCCESS, (state, action: any) => {
                state.teams = { ...state.teams, ...(action.data || {}) };
            })
            .addCase(types.SAVE_TEAM_SUCCESS, (state, action: any) => {
                const team = action.payload;
                if (team && team.id) {
                    state.teams[team.id] = team;
                }
            })
            .addCase(types.DELETE_TEAM_SUCCESS, (state, action: any) => {
                const teamId = action.data; // Note: deleteTeam payload is data in thunk
                if (teamId) {
                    delete state.teams[teamId];
                }
            })
            .addCase(types.RETRIEVE_CONTACTS_SUCCESS, (state, action: any) => {
                state.contacts = action.payload || [];
            })
            .addCase(types.SET_SELECTED_TEAM_VALUE, (state, action: any) => {
                const { key, value } = action.data;
                if (state.selectedTeam) {
                    (state.selectedTeam as any)[key] = value;
                }
            })
            .addCase(types.FETCH_INVITATIONS_SUCCESS, (state, action: any) => {
                state.myInvitations = action.data || {};
            })
            .addCase(types.TEAM_MEMBER_FETCH_SUCCESS, (state, action: any) => {
                const { teamId, members } = action.data;
                if (teamId) {
                    state.teamMembers[teamId] = members || {};
                }
            })
            .addCase(types.TEAM_REQUEST_FETCH_SUCCESS, (state, action: any) => {
                const { teamId, members } = action.data;
                if (teamId) {
                    state.teamRequests[teamId] = members || {};
                }
            });
    }
});

export const selectSelectedTeam = (state: { teams: TeamsState }) =>
    state.teams.selectedTeam;
export const selectMyInvitations = (state: { teams: TeamsState }) =>
    state.teams.myInvitations;
export const selectTeamRequests = (state: { teams: TeamsState }) =>
    state.teams.teamRequests;
export const selectContacts = (state: { teams: TeamsState }) =>
    state.teams.contacts;

export default teamsSlice.reducer;
