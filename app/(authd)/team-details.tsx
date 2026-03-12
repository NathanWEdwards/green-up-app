import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { ButtonBar } from "@/components/button-bar/button-bar";
import { TextDivider } from "@/components/divider";
import { MemberIcon } from "@/components/member-icon/member-icon";
import { MiniMap } from "@/components/mini-map/mini-map";
import { Caption, Title } from "@/components/text";
import { TownItem } from "@/components/town-item/town-item";
import * as teamMemberStatuses from "@/constants/team-member-statuses";
import User from "@/models/user";
import { defaultStyles } from "@/styles/default-styles";

import { selectUser } from "@/store/slices/loginSlice";
import { selectProfile } from "@/store/slices/profileSlice";
import {
    acceptInvitation as acceptInvitationThunk,
    askToJoinTeam as askToJoinTeamThunk,
    joinTeam as joinTeamThunk,
    leaveTeam as leaveTeamThunk,
    removeTeamRequest as removeTeamRequestThunk,
    revokeInvitation as revokeInvitationThunk,
    selectMyInvitations,
    selectSelectedTeam,
    selectTeamMembers,
} from "@/store/slices/teamsSlice";
import { selectTownData } from "@/store/slices/townsSlice";

const myStyles = {
    memberStatusBanner: {
        paddingTop: 5,
        paddingBottom: 5,
    },
    memberStatusMessage: {
        color: "white" as const,
    },
    membership: {
        flex: 1,
        flexDirection: "row" as const,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    teamMember: {
        height: 30,
        marginTop: 15,
    },
    text: { color: "black" as const, fontSize: 20, fontFamily: "Rubik-Regular" },
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles as any);

const TeamDetailsScreen: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const loginUser = useSelector(selectUser) || {};
    const profile = useSelector(selectProfile) || {};
    const currentUser = User.create({ ...loginUser, ...profile });
    const selectedTeam = useSelector(selectSelectedTeam);
    const allTeamMembers = useSelector(selectTeamMembers);
    const teamMembers = allTeamMembers[selectedTeam?.id] || {};
    const invitations = useSelector(selectMyInvitations);
    const townData = useSelector(selectTownData);

    const selectedTownName = (selectedTeam?.town || "").toLowerCase();
    const town = Object.values(townData || {}).find(
        (_town: any) => (_town.name || "").toLowerCase() === selectedTownName
    );

    // Handle bad team reference
    if (!selectedTeam || !selectedTeam.id) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, flexDirection: "row", marginTop: 50, justifyContent: "center" }}>
                    <Text style={{ color: "white", fontSize: 18 }}>{"Sorry we couldn't find that team"}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const declineInvitation = (teamId: string, membershipId: string) => {
        dispatch(revokeInvitationThunk({ teamId, visitorId: membershipId }) as any);
    };

    const acceptInvitation = (teamId: string, user: any) => {
        dispatch(acceptInvitationThunk({ teamId, user }) as any);
    };

    const leaveTeam = (teamId: string, user: any) => {
        Alert.alert(
            "DANGER!",
            "Are you really, really sure you want to leave this team?",
            [
                { text: "No", onPress: () => { }, style: "cancel" },
                {
                    text: "Yes",
                    onPress: () => {
                        router.back();
                        dispatch(leaveTeamThunk({ teamId, user }) as any);
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const removeRequest = (teamId: string, user: any) => {
        dispatch(removeTeamRequestThunk({ teamId, user }) as any);
        router.back();
    };

    const askToJoin = (team: any, user: any) => {
        dispatch(askToJoinTeamThunk({ team, user }) as any);
        router.push("/(authd)/" as any);
    };

    const joinTeam = (team: any, user: any) => {
        dispatch(joinTeamThunk({ team, user }) as any);
        router.push("/(authd)/" as any);
    };

    const toMemberDetails = (teamId: string, membershipId: string) => {
        // TODO: implement team member details route
    };

    const memberKey = currentUser.uid;
    const hasInvitation = Boolean(invitations[selectedTeam.id]);

    const teamMemberList = (
        <View style={{ width: "100%" }}>
            <Text style={{ fontSize: 20, color: "white", textAlign: "center", marginTop: 10 }}>
                {"Team Members"}
            </Text>
            {Object.values(teamMembers).map((member: any, i: number) => (
                <TouchableHighlight
                    key={i}
                    style={{
                        borderStyle: "solid",
                        borderWidth: 1,
                        backgroundColor: "white",
                        width: "100%",
                        height: 52,
                        marginTop: 5,
                    }}
                    onPress={() => toMemberDetails(selectedTeam.id, member.uid)}
                >
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <Image
                                style={{ width: 50, height: 50, marginRight: 10 }}
                                source={{ uri: member.photoURL }}
                            />
                            <Text style={styles.teamMember}>
                                {member.displayName || member.email}
                            </Text>
                        </View>
                        <MemberIcon
                            memberStatus={member.memberStatus}
                            style={{ marginTop: 10, marginRight: 5 }}
                        />
                    </View>
                </TouchableHighlight>
            ))}
        </View>
    );

    const getTeamMemberStatus = (): string => {
        switch (true) {
            case hasInvitation:
                return teamMemberStatuses.INVITED;
            case ((currentUser.teams || {})[selectedTeam.id!] || {}).isMember === false:
                return teamMemberStatuses.REQUEST_TO_JOIN;
            case (teamMembers[memberKey!] || {}).memberStatus === teamMemberStatuses.OWNER:
                return teamMemberStatuses.OWNER;
            case (teamMembers[memberKey!] || {}).memberStatus === teamMemberStatuses.ACCEPTED:
                return teamMemberStatuses.ACCEPTED;
            default:
                return teamMemberStatuses.NOT_INVITED;
        }
    };

    const memberStatus = getTeamMemberStatus();
    const isTeamMember =
        memberStatus === teamMemberStatuses.OWNER || memberStatus === teamMemberStatuses.ACCEPTED;

    const headerButtons = () => {
        switch (true) {
            case memberStatus === teamMemberStatuses.INVITED:
                return [
                    {
                        text: "Accept Invitation",
                        onClick: () => acceptInvitation(selectedTeam.id!, currentUser),
                    },
                    {
                        text: "Decline Invitation",
                        onClick: () => declineInvitation(selectedTeam.id!, currentUser.email || ""),
                    },
                ];
            case selectedTeam.owner?.uid === currentUser.uid:
                return [];
            case memberStatus === teamMemberStatuses.ACCEPTED:
                return [
                    {
                        text: "Leave Team",
                        onClick: () => leaveTeam(selectedTeam.id, currentUser),
                    },
                ];
            case memberStatus === teamMemberStatuses.REQUEST_TO_JOIN:
                return [
                    {
                        text: "Remove Request",
                        onClick: () => removeRequest(selectedTeam.id, currentUser),
                    },
                ];
            case selectedTeam.isPublic:
                return [
                    {
                        text: "Join this team",
                        onClick: () => joinTeam(selectedTeam, currentUser),
                    },
                ];
            default:
                return [
                    {
                        text: "Ask to join this team",
                        onClick: () => askToJoin(selectedTeam, currentUser),
                    },
                ];
        }
    };

    const getMemberStatus = (): React.ReactElement | null => {
        switch (true) {
            case memberStatus === teamMemberStatuses.INVITED:
                return (
                    <View style={styles.membership}>
                        <MemberIcon memberStatus={teamMemberStatuses.INVITED} size={20} />
                        <Text style={styles.memberStatusMessage}>{"You have been invited to this team"}</Text>
                    </View>
                );
            case selectedTeam.owner?.uid === currentUser.uid:
                return (
                    <View style={styles.membership}>
                        <MemberIcon memberStatus={teamMemberStatuses.OWNER} size={20} />
                        <Text style={styles.memberStatusMessage}>{"You are the owner of this team"}</Text>
                    </View>
                );
            case memberStatus === teamMemberStatuses.ACCEPTED:
                return (
                    <View style={styles.membership}>
                        <MemberIcon memberStatus={teamMemberStatuses.ACCEPTED} size={20} />
                        <Text style={styles.memberStatusMessage}>{"You are a member of this team."}</Text>
                    </View>
                );
            case memberStatus === teamMemberStatuses.REQUEST_TO_JOIN:
                return (
                    <View style={styles.membership}>
                        <MemberIcon memberStatus={teamMemberStatuses.REQUEST_TO_JOIN} size={20} />
                        <Text style={styles.memberStatusMessage}>{"Waiting on owner approval"}</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ButtonBar buttonConfigs={headerButtons()} />
            <ScrollView style={[styles.scroll, { padding: 20 }]}>
                <Title>{selectedTeam.name}</Title>
                {getMemberStatus()}
                <TextDivider style={{ backgroundColor: "#FFFFFFAA" }}>
                    <Caption>{"INFORMATION"}</Caption>
                </TextDivider>
                <View style={{ width: "100%", backgroundColor: "white", padding: 20 }}>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{"Owner: "}</Text>
                        <Text style={styles.text}>{selectedTeam.owner?.displayName}</Text>
                    </Text>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{"Where: "}</Text>
                        <Text style={styles.text}>
                            {`${selectedTeam.location || ""}${!selectedTeam.location || !selectedTeam.town ? "" : ", "
                                }${selectedTeam.town || ""}`}
                        </Text>
                    </Text>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{"Date: "}</Text>
                        <Text style={styles.text}>{selectedTeam.date}</Text>
                    </Text>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{"Starts: "}</Text>
                        <Text style={styles.text}>{selectedTeam.start}</Text>
                    </Text>
                    <Text style={styles.dataBlock}>
                        <Text style={styles.text}>{"Ends: "}</Text>
                        <Text style={styles.text}>{selectedTeam.end}</Text>
                    </Text>
                    {!selectedTeam.notes ? null : (
                        <Text style={styles.dataBlock}>
                            <Text style={styles.text}>{"Description: "}</Text>
                            <Text>{selectedTeam.notes}</Text>
                        </Text>
                    )}
                </View>

                <TextDivider style={{ backgroundColor: "#FFFFFFAA" }}>
                    <Caption>{"CLEANING LOCATION"}</Caption>
                </TextDivider>

                {(selectedTeam.locations || []).length > 0 ? (
                    <MiniMap
                        initialLocation={{
                            ...selectedTeam.locations[0].coordinates,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        pinsConfig={selectedTeam.locations.map((l: any) => ({
                            coordinates: l.coordinates,
                            title: selectedTeam.name,
                            description: "team cleaning area",
                            color: "orange",
                        }))}
                    />
                ) : (
                    <Text
                        style={{
                            fontSize: 14,
                            textAlign: "left",
                            padding: 20,
                            backgroundColor: "white",
                            color: "black",
                        }}
                    >
                        {"The team owner has yet to designate a clean up location."}
                    </Text>
                )}
                {town ? (
                    <View style={styles.block}>
                        <TownItem item={town} />
                    </View>
                ) : null}
                <View
                    style={[
                        styles.block,
                        {
                            borderTopWidth: 1,
                            borderBottomWidth: 0,
                            borderTopColor: "rgba(255,255,255,0.2)",
                        },
                    ]}
                >
                    {isTeamMember ? teamMemberList : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TeamDetailsScreen;
