import apiSlice from '@/store/slices/apiSlice';
import * as firebaseDataLayer from '@/data-sources/firebase-data-layer';
import { sanitize } from '@/libs/serify';
import * as messageTypes from '@/constants/message-types';
import * as teamMemberStatuses from '@/constants/team-member-statuses';
import Invitation from '@/models/invitation';
import Message from '@/models/message';
import type Team from '@/models/team';
import TeamMember from '@/models/team-member';
import type User from '@/models/user';

const teamApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        acceptTeamInvitation: builder.mutation<
            Object,
            { teamId: string; user: User }
        >({
            queryFn: async ({ teamId, user }) => {
                const newTeamMember = TeamMember.create(
                    Object.assign({}, user, {
                        memberStatus: teamMemberStatuses.ACCEPTED
                    })
                );
                await firebaseDataLayer.addTeamMember(
                    teamId!,
                    newTeamMember,
                    'ACCEPTED'
                );
                return { data: {} };
            },
            onQueryStarted: async ({ teamId, user }, { queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to accept invitation:', error);
                }
            },
            invalidatesTags: ['AssignedTeams', 'TeamMembers']
        }),
        addTeamMember: builder.mutation<
            Object,
            { teamId: string; user: User; status: string }
        >({
            queryFn: async ({ teamId, user, status }) => {
                await firebaseDataLayer.addTeamMember(teamId, user, status);
                return { data: { teamId, user } };
            },
            onQueryStarted: async (
                { teamId, user, status },
                { queryFulfilled }
            ) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to add team member:', error);
                }
            },
            invalidatesTags: ['TeamMembers', 'TeamRequests']
        }),
        askToJoinTeam: builder.mutation<Object, { team: Team; user: User }>({
            queryFn: async ({ team, user }) => {
                const message = Message.create({
                    text: `${user.displayName || user.email} is requesting to join ${team.name} `,
                    sender: user,
                    teamId: team.id,
                    type: messageTypes.REQUEST_TO_JOIN
                });
                const teamId = team.id;
                await firebaseDataLayer.addTeamRequest(teamId!, user);
                await firebaseDataLayer.sendUserMessage(
                    team.owner.uid!,
                    message
                );
                return { data: {} };
            },
            onQueryStarted: async (
                { team, user },
                { dispatch, queryFulfilled }
            ) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to ask to join team:', error);
                }
            },
            invalidatesTags: ['AssignedTeams', 'TeamRequests']
        }),
        createTeam: builder.mutation<Object, { team: Team; user: User }>({
            queryFn: async ({ team, user }) => {
                await firebaseDataLayer.createTeam(team, user);
                return { data: {} };
            },
            onQueryStarted: async ({ team, user }, { queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to create team:', error);
                }
            },
            invalidatesTags: ['AssignedTeams', 'Team']
        }),
        deleteTeam: builder.mutation<Object, { teamId: string }>({
            queryFn: async ({ teamId }) => {
                await firebaseDataLayer.deleteTeam(teamId);
                return { data: {} };
            },
            onQueryStarted: async ({ teamId }, { queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to delete team:', error);
                }
            },
            invalidatesTags: ['AssignedTeams', 'Team']
        }),
        getTeams: builder.query<Record<string, Team>, void>({
            queryFn: async () => {
                const teams = await firebaseDataLayer.fetchTeams();
                const serializable = sanitize(teams);
                return { data: serializable };
            },
            providesTags: ['Team']
        }),
        getAssignedTeams: builder.query<Record<string, Team>, string>({
            queryFn: async (uid: string) => {
                const teams = await firebaseDataLayer.getAssignedTeams(uid);
                const serializable = sanitize(teams);
                return { data: serializable };
            },
            providesTags: ['AssignedTeams']
        }),
        getTeamMembers: builder.query<Record<string, TeamMember>, string>({
            queryFn: async (teamId: string) => {
                const teamMembers =
                    await firebaseDataLayer.getTeamMembers(teamId);
                const serializable = sanitize(teamMembers);
                return { data: serializable };
            },
            providesTags: ['TeamMembers']
        }),
        getTeamRequests: builder.query<Record<string, any>, string>({
            queryFn: async (teamId: string) => {
                const requests =
                    await firebaseDataLayer.getTeamRequests(teamId);
                const serializable = sanitize(requests);
                return { data: serializable };
            },
            providesTags: ['TeamRequests']
        }),
        inviteContacts: builder.mutation<
            Object,
            { team: Team; teamMembers: TeamMember[]; user: User }
        >({
            queryFn: async ({ team, teamMembers, user }) => {
                const invites = teamMembers.map(
                    async (teamMember: TeamMember): Promise<any> => {
                        const invitation = Invitation.create({
                            team,
                            sender: user,
                            teamMember
                        });
                        return await firebaseDataLayer.inviteTeamMember(
                            invitation
                        );
                    }
                );
                await Promise.all(invites);
                return { data: {} };
            },
            onQueryStarted: async (
                { team, teamMembers, user },
                { queryFulfilled }
            ) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to invite team members:', error);
                }
            },
            invalidatesTags: ['TeamMembers']
        }),
        joinTeam: builder.mutation<Object, { team: Team; user: User }>({
            queryFn: async ({ team, user }) => {
                const teamId = team.id;
                const message = Message.create({
                    text: `${user.displayName || user.email} has joined ${team.name} `,
                    sender: user,
                    teamId: team.id,
                    type: messageTypes.REQUEST_TO_JOIN
                });
                await firebaseDataLayer.addTeamMember(
                    teamId!,
                    user,
                    'ACCEPTED'
                );
                await firebaseDataLayer.sendUserMessage(
                    team.owner.uid!,
                    message
                );
                return { data: {} };
            },
            onQueryStarted: async ({ team, user }, { queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to join team:', error);
                }
            },
            invalidatesTags: ['AssignedTeams', 'Team', 'TeamMembers']
        }),
        leaveTeam: builder.mutation<Object, { teamId: string; user: User }>({
            queryFn: async ({ teamId, user }) => {
                await firebaseDataLayer.leaveTeam(teamId, user);
                return { data: {} };
            },
            onQueryStarted: async ({ teamId, user }, { queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to leave team:', error);
                }
            },
            invalidatesTags: ['AssignedTeams', 'Team', 'TeamMembers']
        }),
        removeTeamMember: builder.mutation<
            Object,
            { teamId: string; teamMember: TeamMember }
        >({
            queryFn: async ({ teamId, teamMember }) => {
                await firebaseDataLayer.removeTeamMember(teamId, teamMember);
                return { data: {} };
            },
            onQueryStarted: async ({}, { queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to remove team member:', error);
                }
            },
            invalidatesTags: ['TeamMembers']
        }),
        removeTeamRequest: builder.mutation<Object, { team: Team; user: User }>(
            {
                queryFn: async ({ team, user }) => {
                    await firebaseDataLayer.removeTeamRequest(team.id!, user);
                    return { data: {} };
                },
                onQueryStarted: async ({ team, user }, { queryFulfilled }) => {
                    try {
                        await queryFulfilled;
                    } catch (error) {
                        console.error('Failed to remove team request:', error);
                    }
                },
                invalidatesTags: ['AssignedTeams', 'TeamRequests']
            }
        ),
        revokeTeamInvitation: builder.mutation<
            Object,
            { teamId: string; uid: string }
        >({
            queryFn: async ({ teamId, uid }) => {
                await firebaseDataLayer.revokeInvitation(teamId, uid);
                return { data: { teamId, uid } };
            },
            onQueryStarted: async ({}, { queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to revoke invitation:', error);
                }
            },
            invalidatesTags: ['AssignedTeams', 'TeamMembers']
        }),
        saveTeam: builder.mutation<Object, { team: Team }>({
            queryFn: async ({ team }) => {
                await firebaseDataLayer.saveTeam(team);
                return { data: {} };
            },
            onQueryStarted: async ({ team }, { queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to save team:', error);
                }
            },
            invalidatesTags: ['AssignedTeams', 'Team']
        }),
        updateTeamLocations: builder.mutation<
            Object,
            { teamId: string; locations: Location[] }
        >({
            queryFn: async ({ teamId, locations }) => {
                await firebaseDataLayer.saveLocations(locations, teamId);
                return { data: locations };
            },
            onQueryStarted: async (
                { teamId, locations },
                { queryFulfilled }
            ) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to update team locations:', error);
                }
            },
            invalidatesTags: ['Team']
        }),
        updateTeamMember: builder.mutation<
            Object,
            { teamId: string; teamMember: TeamMember; status?: string }
        >({
            queryFn: async ({ teamId, teamMember, status }) => {
                const updatedTeamMember = TeamMember.create(
                    Object.assign({}, teamMember, {
                        memberStatus: status || teamMember.memberStatus
                    })
                );
                await firebaseDataLayer.updateTeamMember(
                    teamId,
                    updatedTeamMember
                );
                return { data: { teamId, teamMember: updatedTeamMember } };
            },
            onQueryStarted: async (
                { teamId, teamMember, status },
                { queryFulfilled }
            ) => {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Failed to update team member:', error);
                }
            },
            invalidatesTags: ['TeamMembers']
        })
    })
});

export const {
    useAcceptTeamInvitationMutation,
    useAddTeamMemberMutation,
    useAskToJoinTeamMutation,
    useCreateTeamMutation,
    useDeleteTeamMutation,
    useGetAssignedTeamsQuery,
    useGetTeamMembersQuery,
    useGetTeamRequestsQuery,
    useGetTeamsQuery,
    useInviteContactsMutation,
    useJoinTeamMutation,
    useLeaveTeamMutation,
    useRemoveTeamMemberMutation,
    useRemoveTeamRequestMutation,
    useRevokeTeamInvitationMutation,
    useSaveTeamMutation,
    useUpdateTeamMemberMutation,
    useUpdateTeamLocationsMutation
} = teamApi;
