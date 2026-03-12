import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as Contacts from 'expo-contacts';

import * as types from "@/constants/action-types";
import * as messageTypes from "@/constants/message-types";
import * as memberStatus from "@/constants/team-member-statuses";
import * as firebaseDataLayer from "@/data-sources/firebase-data-layer";
import Contact from '@/models/contact';
import Invitation from "@/models/invitation";
import Message from '@/models/message';
import Team from '@/models/team';
import TeamMember from "@/models/team-member";

const initialState = {
    teams: []
}

export const retrieveContact = createAsyncThunk(
    'teams/retrieveContacts',
    async (pageSize: number = 40, { dispatch }) => {
        // recursively get all contacts
        async function getContactsAsync(pageSize: number, pageOffset: number = 0): Promise<any> {
            const data = await Contacts.getContactsAsync({
                fields: [
                    Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.PhoneticFirstName, Contacts.Fields.PhoneticLastName
                ],
                pageSize,
                pageOffset
            });
            const contacts = data.data.map((contact: Contacts.Contact): Contact => Contact.create(contact));
            dispatch({ type: types.RETRIEVE_CONTACTS_SUCCESS, payload: contacts });
            return (data.hasNextPage)
                ? contacts.concat(await getContactsAsync(pageSize, pageOffset + pageSize))
                : contacts;
        }

        // Ask for permission to query contacts.
        try {
            const permission = await Contacts.requestPermissionsAsync();
            if (permission.status !== "granted") {
                // Permission was denied...
                dispatch({
                    type: types.RETRIEVE_CONTACTS_FAIL,
                    error: "User has not granted permission to access contacts"
                });
            } else {
                // we have permission lets start getting contacts
                await getContactsAsync(pageSize);
            }
        } catch (error: any) {
            dispatch({ type: types.RETRIEVE_CONTACTS_FAIL, payload: error.message || "Failed to retrieve contacts" });
        }
    }
);

export const inviteContacts = createAsyncThunk(
    'teams/inviteContacts',
    async (args: any, { dispatch }) => {
        try {
            const { team, teamMembers, currentUser } = args;
            const invites = teamMembers.map(async (teamMember: TeamMember): Promise<any> => {
                const invitation = Invitation.create({ team, sender: currentUser, teamMember });
                return await firebaseDataLayer.inviteTeamMember(invitation);
            });
            Promise.all(invites)
                .then((data: Array<any>) => {
                    dispatch({ type: types.SEND_INVITATIONS_SUCCESS, data });
                })
        } catch (error: any) {
            dispatch({ type: types.SEND_INVITATIONS_FAIL, payload: error.message || "Failed to send invitations" });
        };
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
        const teamId = typeof team === "string" ? team : team.id;
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
        const teamId = typeof team === "string" ? team : team.id;
        await firebaseDataLayer.addTeamMember(teamId, user, "ACCEPTED", dispatch);
        await firebaseDataLayer.sendUserMessage(team.owner.uid, message);
    }
);

export const removeTeamRequest = createAsyncThunk(
    'teams/removeTeamRequest',
    async (args: any, { dispatch }) => {
        const { user, team } = args;
        const teamId = typeof team === "string" ? team : team.id;
        await firebaseDataLayer.removeTeamRequest(teamId, user);
    }
);

export const acceptInvitation = createAsyncThunk(
    'teams/acceptInvitation',
    async (args: any, { dispatch }) => {
        const { user, team } = args;
        const teamId = typeof team === "string" ? team : team.id;
        const newTeamMember = TeamMember.create(Object.assign({}, user, { memberStatus: memberStatus.ACCEPTED }));
        await firebaseDataLayer.addTeamMember(teamId, newTeamMember, "ACCEPTED", dispatch);
    }
);

export const selectTeam = createAsyncThunk(
    'teams/selectTeam',
    async (args: any, { dispatch }) => {
        try {
            const { team } = args;
            const savedTeam = await firebaseDataLayer.saveTeam(team);
            dispatch({ type: types.SAVE_TEAM_SUCCESS, payload: savedTeam });
        } catch (error: any) {
            dispatch({ type: types.SAVE_TEAM_FAIL, payload: error.message || "Failed to save team" });
        }
    }
);

export const createTeam = createAsyncThunk(
    'teams/createTeam',
    async (args: any, { dispatch }) => {
        try {
            const { team, user } = args;
            await firebaseDataLayer.createTeam(Team.create(team), TeamMember.create(user), dispatch);
        } catch (error: any) {
            dispatch({ type: types.SAVE_TEAM_FAIL, payload: error.message || "Failed to create team" });
        }
    }
);

export const deleteTeam = createAsyncThunk(
    'teams/deleteTeam',
    async (args: any, { dispatch }) => {
        try {
            const { teamId } = args;
            const data = firebaseDataLayer.deleteTeam(teamId);
            dispatch({ type: types.DELETE_TEAM_SUCCESS, data });
        } catch (error: any ) {
            dispatch({ type: types.DELETE_TEAM_FAIL, payload: error.message || "Failed to delete team" });
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
        }
    }
);

export const removeTeamMember = createAsyncThunk(
    'teams/removeTeamMember',
    async (args: any, { dispatch }) => {
        try {
            const { teamId, teamMember } = args;
            const data = firebaseDataLayer.removeTeamMember(teamId, teamMember);
            dispatch({ type: types.REMOVE_TEAM_MEMBER_SUCCESS, payload: data });
        } catch (error: any) {
            dispatch({ type: types.REMOVE_TEAM_MEMBER_FAIL, payload: error.message || "Failed to remove team member" });
        }
    }
);

export const revokeInvitation = createAsyncThunk(
    'teams/revokeInvitation',
    async (args: any, { dispatch }) => {
        try {
            const { teamId, teamMember } = args;
            const data = firebaseDataLayer.revokeInvitation(teamId, teamMember);
            dispatch({ type: types.REVOKE_INVITATION_SUCCESS, payload: { teamId, teamMember } });
        } catch (error: any) {
            dispatch({ type: types.REVOKE_INVITATION_FAIL, payload: error.message || "Failed to revoke invitation" });
        }
    }
);

export const addTeamMember = createAsyncThunk(
    'teams/addTeamMember',
    async (args: any, { dispatch }) => {
        try {
            const { teamId, teamMember, status } = args;
            const data = firebaseDataLayer.addTeamMember(teamId, teamMember, "ACCEPTED", dispatch);
            dispatch({ type: types.ADD_TEAM_MEMBER_SUCCESS, payload: { teamId, teamMember } });
        } catch (error: any) {
            dispatch({ type: types.ADD_TEAM_MEMBER_FAIL, payload: error.message || "Failed to add team member" });
        }
    }
);

export const updateTeamMember = createAsyncThunk(
    'teams/updateTeamMember',
    async (args: any, { dispatch }) => {
        try {
            const { teamId, teamMember, status } = args;
            const newMember = TeamMember.create(Object.assign({}, teamMember, { memberStatus: status || teamMember.memberStatus }));
            await firebaseDataLayer.updateTeamMember(teamId, newMember)
            dispatch({ type: types.UPDATE_TEAM_MEMBER_SUCCESS, payload: { teamId, newMember } });
        } catch (error: any) {
            dispatch({ type: types.UPDATE_TEAM_MEMBER_FAIL, payload: error.message || "Failed to update team member"});
        }
    }
);

export const saveLocations = createAsyncThunk(
    'teams/saveLocations',
    async (args: any, { dispatch }) => {
        try {
            const { team, locations } = args;
            if (team.id) {
                await firebaseDataLayer.saveLocations(locations, team.id)
                dispatch({ type: types.SAVE_LOCATIONS_SUCCESS, payload: locations });
            } else {
                dispatch({ type: types.SAVE_LOCATIONS_FAIL, payload: "Invalid Team" });
            }
        } catch (error: any) {
            dispatch({ type: types.SAVE_LOCATIONS_FAIL, payload: error.message || "Failed to save locations" });
        }
    }
);

export const selectTeamById = createAsyncThunk(
    'teams/selectTeamById',
    async (args: any, { dispatch }) => {
        const { teamId } = args;
        return { type: types.SELECT_TEAM_BY_ID, payload: teamId };
    }
);
        
export const leaveTeam = createAsyncThunk(
    'teams/leaveTeam',
    async (args: any, { dispatch }) => {
        try {
            const { teamId, user } = args;
            await firebaseDataLayer.leaveTeam(teamId, user);
            dispatch({ type: types.LEAVE_TEAM_SUCCESS, payload: teamId });
        } catch (error: any) {
            dispatch({ type: types.LEAVE_TEAM_FAIL, payload: error.message || "Failed to leave team" });
        }
    }
);

export const deleteMessage = createAsyncThunk(
    'teams/deleteMessage',
    async (args: any, { dispatch }) => {
        try {
            const { userId, messageId } = args;
            await firebaseDataLayer.deleteMessage(userId, messageId);
            dispatch({ type: types.DELETE_MESSAGE_SUCCESS, payload: messageId });
        } catch (error: any) {
            dispatch({ type: types.DELETE_MESSAGE_FAIL, payload: error.message || "Failed to delete message" });
        }
    }
);

const teamsSlice = createSlice({
    name: 'teams',
    initialState,
    reducers: {}
});

export const selectAllTeams = (state: any) => state.teams.teams;
export const selectTeamMembers = (state: any) => state.teams.teamMembers || {};
export const selectSelectedTeam = (state: any) => state.teams.selectedTeam || {};
export const selectMyInvitations = (state: any) => state.teams.myInvitations || {};
export const selectTeamRequests = (state: any) => state.teams.teamRequests || {};
export const selectContacts = (state: any) => state.teams.contacts || [];

export default teamsSlice.reducer;