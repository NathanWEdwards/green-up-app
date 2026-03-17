import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import * as Contacts from 'expo-contacts';
import { serify, defaultOptions } from '@karmaniverous/serify-deserify';

import * as types from '@/constants/action-types';
import * as messageTypes from '@/constants/message-types';
import * as memberStatus from '@/constants/team-member-statuses';
import * as firebaseDataLayer from '@/data-sources/firebase-data-layer';
import Contact from '@/models/contact';
import Invitation from '@/models/invitation';
import Message from '@/models/message';
import Team from '@/models/team';
import TeamMember from '@/models/team-member';
import { sanitize } from '@/libs/serify';

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

export const teamsApi = createApi({
    baseQuery: fakeBaseQuery(),
    endpoints: (builder) => ({
        getTeams: builder.query<Record<string, Team>, void>({
            queryFn: async () => {
                const teams = await firebaseDataLayer.fetchTeams();
                const serializable = sanitize(teams);
                return { data: serializable };
            }
        }),
        getAssignedTeams: builder.query<Record<string, Team>, string>({
            queryFn: async (uid: string) => {
                const teams = await firebaseDataLayer.getAssignedTeams(uid);
                const serializable = sanitize(teams);
                return { data: serializable };
            }
        })
    })
});

export const getTeams = createAsyncThunk(
    'teams/getTeams',
    async (_, { rejectWithValue }) => {
        try {
            const teams = await firebaseDataLayer.fetchTeams();
            const serializable = sanitize(teams);
            return serializable;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get teams.');
        }
    }
);

export const getAssignedTeams = createAsyncThunk(
    'teams/getAssignedTeams',
    async (uid: string, { rejectWithValue }) => {
        try {
            const teams = await firebaseDataLayer.getAssignedTeams(uid);
            const serializable = sanitize(teams);
            return serializable;
        } catch (error: any) {
            return rejectWithValue(
                error.message || 'Failed to get team assignments.'
            );
        }
    }
);

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

export const inviteContacts = createAsyncThunk(
    'teams/inviteContacts',
    async (args: any, { rejectWithValue }) => {
        try {
            const { team, teamMembers, currentUser } = args;
            const invites = teamMembers.map(
                async (teamMember: TeamMember): Promise<any> => {
                    const invitation = Invitation.create({
                        team,
                        sender: currentUser,
                        teamMember
                    });
                    return await firebaseDataLayer.inviteTeamMember(invitation);
                }
            );
            const data = await Promise.all(invites);
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.message || 'Failed to send invitations'
            );
        }
    }
);

export const askToJoinTeam = createAsyncThunk(
    'teams/askToJoinTeam',
    async (args: any, { dispatch }) => {
        const { user, team } = args;
        const message = Message.create({
            text: `${user.displayName || user.email} is requesting to join ${team.name} `,
            sender: user,
            teamId: team.id,
            type: messageTypes.REQUEST_TO_JOIN
        });
        const teamId = typeof team === 'string' ? team : team.id;
        await firebaseDataLayer.addTeamRequest(teamId, user);
        await firebaseDataLayer.sendUserMessage(team.owner.uid, message);
    }
);

export const joinTeam = createAsyncThunk(
    'teams/joinTeam',
    async (args: any, { dispatch }) => {
        const { user, team } = args;
        const message = Message.create({
            text: `${user.displayName || user.email} has joined ${team.name} `,
            sender: user,
            teamId: team.id,
            type: messageTypes.REQUEST_TO_JOIN
        });
        const teamId = typeof team === 'string' ? team : team.id;
        await firebaseDataLayer.addTeamMember(
            teamId,
            user,
            'ACCEPTED',
            dispatch
        );
        await firebaseDataLayer.sendUserMessage(team.owner.uid, message);
    }
);

export const removeTeamRequest = createAsyncThunk(
    'teams/removeTeamRequest',
    async (args: any, { rejectWithValue }) => {
        try {
            const { user, team } = args;
            const teamId = typeof team === 'string' ? team : team.id;
            await firebaseDataLayer.removeTeamRequest(teamId, user);
            const assignedTeams = await firebaseDataLayer.getAssignedTeams(
                user.uid
            );
            return assignedTeams;
        } catch (error: any) {
            console.log('error', error);
            return rejectWithValue(
                error.message || 'Failed to remove team request'
            );
        }
    }
);

export const acceptInvitation = createAsyncThunk(
    'teams/acceptInvitation',
    async (args: any, { dispatch }) => {
        const { user, team } = args;
        const teamId = typeof team === 'string' ? team : team.id;
        const newTeamMember = TeamMember.create(
            Object.assign({}, user, { memberStatus: memberStatus.ACCEPTED })
        );
        await firebaseDataLayer.addTeamMember(
            teamId,
            newTeamMember,
            'ACCEPTED',
            dispatch
        );
    }
);

export const saveTeam = createAsyncThunk(
    'teams/saveTeam',
    async (args: any, { rejectWithValue }) => {
        try {
            const { team } = args;
            const savedTeam = await firebaseDataLayer.saveTeam(team);
            return savedTeam;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to save team');
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

export const createTeam = createAsyncThunk(
    'teams/createTeam',
    async (args: any, { dispatch, rejectWithValue }) => {
        try {
            const { team, user } = args;
            await firebaseDataLayer.createTeam(
                Team.create(team),
                TeamMember.create(user),
                dispatch
            );
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create team');
        }
    }
);

export const deleteTeam = createAsyncThunk(
    'teams/deleteTeam',
    async (args: any, { rejectWithValue }) => {
        try {
            const { teamId } = args;
            await firebaseDataLayer.deleteTeam(teamId);
            return teamId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete team');
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

export const removeTeamMember = createAsyncThunk(
    'teams/removeTeamMember',
    async (args: any, { rejectWithValue }) => {
        try {
            const { teamId, teamMember } = args;
            const data = await firebaseDataLayer.removeTeamMember(
                teamId,
                teamMember
            );
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.message || 'Failed to remove team member'
            );
        }
    }
);

export const revokeInvitation = createAsyncThunk(
    'teams/revokeInvitation',
    async (args: any, { rejectWithValue }) => {
        try {
            const { teamId, teamMember } = args;
            await firebaseDataLayer.revokeInvitation(teamId, teamMember);
            return { teamId, teamMember };
        } catch (error: any) {
            return rejectWithValue(
                error.message || 'Failed to revoke invitation'
            );
        }
    }
);

export const addTeamMember = createAsyncThunk(
    'teams/addTeamMember',
    async (args: any, { dispatch, rejectWithValue }) => {
        try {
            const { teamId, teamMember, status } = args;
            await firebaseDataLayer.addTeamMember(
                teamId,
                teamMember,
                'ACCEPTED',
                dispatch
            );
            return { teamId, teamMember };
        } catch (error: any) {
            return rejectWithValue(
                error.message || 'Failed to add team member'
            );
        }
    }
);

export const updateTeamMember = createAsyncThunk(
    'teams/updateTeamMember',
    async (args: any, { rejectWithValue }) => {
        try {
            const { teamId, teamMember, status } = args;
            const newMember = TeamMember.create(
                Object.assign({}, teamMember, {
                    memberStatus: status || teamMember.memberStatus
                })
            );
            await firebaseDataLayer.updateTeamMember(teamId, newMember);
            return { teamId, newMember };
        } catch (error: any) {
            return rejectWithValue(
                error.message || 'Failed to update team member'
            );
        }
    }
);

export const saveLocations = createAsyncThunk(
    'teams/saveLocations',
    async (args: any, { rejectWithValue }) => {
        try {
            const { team, locations } = args;
            if (team.id) {
                await firebaseDataLayer.saveLocations(locations, team.id);
                return locations;
            } else {
                return rejectWithValue('Invalid Team');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to save locations');
        }
    }
);

export const selectTeamById = createAsyncThunk(
    'teams/selectTeamById',
    async (args: any) => {
        const { teamId } = args;
        return teamId;
    }
);

export const leaveTeam = createAsyncThunk(
    'teams/leaveTeam',
    async (args: any, { rejectWithValue }) => {
        try {
            const { teamId, user } = args;
            await firebaseDataLayer.leaveTeam(teamId, user);
            return teamId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to leave team');
        }
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
            .addCase(getTeams.fulfilled, (state, action) => {
                if (action.payload) {
                    state.teams = { ...state.teams, ...action.payload };
                }
            })
            .addCase(removeTeamRequest.fulfilled, (state, action) => {
                if (action.payload) {
                    state.assignedTeams = action.payload;
                }
            })
            .addCase(selectTeam.fulfilled, (state, action) => {
                const { team, teamMembers } = action.payload;
                state.selectedTeam = team as Team;
                state.teamMembers = teamMembers as Record<string, TeamMember>;
            })
            .addCase(saveTeam.fulfilled, (state, action) => {
                // If saveTeam returns the updated team, optionally update here
                if (action.payload && action.payload.id) {
                    state.teams[action.payload.id] = action.payload;
                }
            })
            .addCase(getAssignedTeams.fulfilled, (state, action) => {
                if (action.payload) {
                    state.assignedTeams = action.payload;
                }
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

export const selectAllTeams = (state: { teams: TeamsState }) =>
    state.teams.teams;
export const selectAssignedTeams = (state: { teams: TeamsState }) =>
    state.teams.assignedTeams;
export const selectTeamMembers = (state: { teams: TeamsState }) =>
    state.teams.teamMembers;
export const selectSelectedTeam = (state: { teams: TeamsState }) =>
    state.teams.selectedTeam;
export const selectMyInvitations = (state: { teams: TeamsState }) =>
    state.teams.myInvitations;
export const selectTeamRequests = (state: { teams: TeamsState }) =>
    state.teams.teamRequests;
export const selectContacts = (state: { teams: TeamsState }) =>
    state.teams.contacts;

export default teamsSlice.reducer;
