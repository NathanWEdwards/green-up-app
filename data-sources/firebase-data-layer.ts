import * as R from 'ramda';
import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateEmail as updateEmailFirebase,
    updateProfile as updateProfileFirebase
} from '@react-native-firebase/auth';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    updateDoc,
    where
} from '@react-native-firebase/firestore';
import { Action, Dispatch } from '@reduxjs/toolkit';

import { firebaseAuth, firestore } from '@/clients/firebase';
import * as actionTypes from '@/constants/action-types';
import * as messageTypes from '@/constants/message-types';
import * as teamStatuses from '@/constants/team-member-statuses';
import Celebration from '@/models/celebration';
import Invitation from '@/models/invitation';
import Message from '@/models/message';
import SupplyDistributionSite from '@/models/supply-distribution-site';
import Team from '@/models/team';
import TeamMember from '@/models/team-member';
import Town from '@/models/town';
import TrashCollectionSite from '@/models/trash-collection-site';
import TrashDrop from '@/models/trash-drop';
import User from '@/models/user';
import { defaultGravatar } from '../libs/avatars';
import * as dataLayerActions from './data-layer-actions';
import { store } from '@/store/configure-store';

const dispatch = store.dispatch;

let myListeners: any = {};

const deconstruct = (obj: Object): Object => {
    let objAsString = JSON.stringify(obj);
    let objAsObj = JSON.parse(objAsString);
    return objAsObj;
};

const removeListener = (key: string) => {
    if (myListeners[key]) {
        console.log('Removing Listener:', key);
        myListeners[key]();
        delete myListeners[key];
    }
};

const addListener = (key: string, listener: () => void) => {
    if (!key) {
        throw Error('Cannot add listener. Invalid listener key');
    }
    console.log('Adding Listener:', key);
    removeListener(key);
    myListeners[key] = listener;
};

const removeAllListeners = (): Promise<any> =>
    new Promise((resolve: any, reject: any) => {
        try {
            Object.values(myListeners).forEach((listener: any) => {
                listener();
            });
            myListeners = {};
            resolve(true);
        } catch (e) {
            reject(e);
        }
    });

type ReturnType = string | Array<string> | Object;
type EntryType = {
    toString: () => string;
    map: (arg0: any) => Array<ReturnType>;
};

function returnType(entry: EntryType): string | Array<string> | Object {
    switch (true) {
        case entry instanceof Date:
            return entry.toString();
        case Array.isArray(entry):
            return entry.map((x: EntryType): ReturnType => returnType(x));
        case entry !== null && typeof entry === 'object':
            return stringifyDates(entry); // eslint-disable-line
        default:
            return entry;
    }
}

function stringifyDates(obj: Object): Object {
    return Object.entries(obj).reduce(
        (returnObj: Object, entry: [string, any]): Object =>
            Object.assign({}, returnObj, {
                [entry[0]]: returnType(entry[1])
            }),
        {}
    );
}

const getCollection = async (
    Model: any,
    path: string,
    dispatchSuccessType: string,
    dispatchErrorType: string
) => {
    try {
        const collectionRef = collection(firestore, path);
        const querySnapshot = await getDocs(collectionRef);
        const data: any = {};
        querySnapshot.forEach((doc: any) => {
            data[doc.id] = Model.create(doc.data(), doc.id);
        });
        dispatch({ type: dispatchSuccessType, data });
        return data;
    } catch (error) {
        dispatch({ type: dispatchErrorType, error });
    }
};

/** *************** Profiles ***************  **/

export async function updateProfile(profile: any): Promise<any> {
    const newProfile = Object.assign({}, profile, {
        updated: new Date().toString()
    }); // TODO fix this hack right
    const profilesCollectionRef = collection(firestore, 'profiles');
    const userProfileDocRef = doc(profilesCollectionRef, profile.uid);

    await updateDoc(userProfileDocRef, newProfile);
    // const newProfile = Object.assign({}, profile, { updated: (new Date()).toString() }); // TODO fix this hack right
    // const profileUpdate = db.collection("profiles").doc(profile.uid).update(newProfile);
    // return profileUpdate.catch((error: Object) => {
    //     dispatch(dataLayerActions.profileUpdateFail(error));
    // });
}

async function createProfile(
    user: User,
    dispatch: Dispatch<Action>
): Promise<any> {
    const now = new Date();
    const newProfile = User.create(user);
    const profilesCollectionRef = collection(firestore, 'profiles');
    const userProfileDocRef = doc(profilesCollectionRef, newProfile.uid);

    try {
        await setDoc(userProfileDocRef, {
            ...newProfile,
            created: now,
            updated: now
        });
    } catch (error: any) {
        dispatch(dataLayerActions.profileCreateFail(error));
    }

    // const now = new Date();
    // const newProfile = User.create(user);

    // return db.collection("profiles").doc(newProfile.uid).set({
    //     ...newProfile,
    //     created: now,
    //     updated: now
    // }).catch((error: Object) => {
    //     dispatch(dataLayerActions.profileCreateFail(error));
    // });
}

/** *************** INITIALIZATION *************** **/

const setupInvitedTeamMemberListener = (
    teamIds: Array<string>,
    dispatch: Dispatch<Action>
): Array<any> =>
    (teamIds || []).map((teamId) => {
        const teamRef = doc(firestore, `teams/${teamId}`);
        const ref = collection(teamRef, `invitations`);

        const onSnapshotz = (querySnapshot: any) => {
            const data: any[] = [];
            querySnapshot.forEach((_doc: any) => {
                data.push({ ..._doc.data(), id: _doc.id });
            });
            const invitees = data.reduce(
                (obj, member): Object => ({ ...obj, [member.id]: member }),
                {}
            );
            dispatch(
                dataLayerActions.inviteesFetchSuccessful(invitees, teamId)
            );
        };
        const onError = (error: Object | string) => {
            // eslint-disable-next-line no-console
            console.error('setupInvitedTeamMember Error: ', error);
            // TODO : Handle the error
        };

        const listener = onSnapshot(ref, { next: onSnapshotz, error: onError });

        addListener(`teamMembers_${teamId}_invitations`, listener);
        // const ref = db.collection(`teams/${ teamId }/invitations`);

        // const onSnapshot = (querySnapshot: Object) => {
        //     const data = [];
        //     querySnapshot.forEach((_doc: Object) => {
        //         data.push({ ..._doc.data(), id: _doc.id });
        //     });
        //     const invitees = data.reduce((obj, member): Object => ({ ...obj, [member.id]: member }), {});
        //     dispatch(dataLayerActions.inviteesFetchSuccessful(invitees, teamId));
        // };
        // const onError = ((error: Object | string) => {
        //     // eslint-disable-next-line no-console
        //     console.error("setupInvitedTeamMember Error: ", error);
        //     // TODO : Handle the error
        // });

        // addListener(`teamMembers_${ teamId }_invitations}`, ref.onSnapshot(onSnapshot, onError));
    });

function setupInvitationListener(
    email: string = '',
    dispatch: Dispatch<Action>
) {
    const ref = doc(firestore, `/invitations/${email || ''}`);
    const teamQuery = query(collection(ref, 'teams'));

    const snaphostListener = onSnapshot(
        teamQuery,
        (querySnapshot) => {
            const data: any[] = [];

            querySnapshot.forEach((doc: any) => {
                data.push(Invitation.create({ ...doc.data(), id: doc.id }));
            });
            // this should be an array not an object
            const invitations = data.reduce(
                (obj: any, team: any): Object => ({
                    ...obj,
                    [team.id]: team
                }),
                {}
            );
            const messages = Object.values(data).reduce(
                (obj: any, invite: any): Object => ({
                    ...obj,
                    [invite.id]: Message.create({
                        id: invite.id,
                        text: `${(invite.sender || {}).displayName} has invited you to join team : ${(invite.team || {}).name}`,
                        sender: invite.sender,
                        teamId: (invite.team || {}).id,
                        read: false,
                        active: true,
                        link: null,
                        type: messageTypes.INVITATION,
                        created: invite.created
                    })
                }),
                {}
            );

            // Add listeners for new team member list changes
            // Object.keys(invitations).forEach(key => {
            //     setupInvitedTeamMemberListener(key, dispatch);
            // });
            dispatch(
                dataLayerActions.messageFetchSuccessful({
                    invitations: messages
                })
            );
            dispatch(dataLayerActions.invitationFetchSuccessful(invitations));
        },
        (error: Error) => {
            // eslint-disable-next-line no-console
            console.error('setupInvitationListener Error', error);
            // TODO : Handle the error
        }
    );

    addListener(`invitations_${email || ''}_teams`, snaphostListener);
    // const ref = db.collection(`/invitations/${ email || "" }/teams`);

    // addListener(`invitations_${ email || "" }_teams`,
    //     ref.onSnapshot(
    //         (querySnapshot: QuerySnapshot) => {
    //             const data = [];
    //             querySnapshot.forEach((doc: Object) => {
    //                 data.push(Invitation.create({ ...doc.data(), id: doc.id }));
    //             });
    //             // this should be an array not an object
    //             const invitations = data.reduce(
    //                 (obj: Object, team: Object): Object => ({
    //                     ...obj,
    //                     [team.id]: team
    //                 }), {});
    //             const messages = Object.values(data).reduce((obj: Object, invite: Object): Object => (
    //                 {
    //                     ...obj, [invite.id]: Message.create({
    //                         id: invite.id,
    //                         text: `${ (invite.sender || {}).displayName } has invited you to join team : ${ (invite.team || {}).name }`,
    //                         sender: invite.sender,
    //                         teamId: (invite.team || {}).id,
    //                         read: false,
    //                         active: true,
    //                         link: null,
    //                         type: messageTypes.INVITATION,
    //                         created: invite.created
    //                     })
    //                 }
    //             ), {});

    //             // Add listeners for new team member list changes
    //             // Object.keys(invitations).forEach(key => {
    //             //     setupInvitedTeamMemberListener(key, dispatch);
    //             // });
    //             dispatch(dataLayerActions.messageFetchSuccessful({ invitations: messages }));
    //             dispatch(dataLayerActions.invitationFetchSuccessful(invitations));
    //         },
    //         ((error: Error) => {
    //             // eslint-disable-next-line no-console
    //             console.error("setupInvitationListener Error", error);
    //             // TODO : Handle the error
    //         })
    //     )
    // );
}

function setupMessageListener(uid: string = '', dispatch: Dispatch<Action>) {
    const ref = doc(firestore, `messages/${uid || ''}`);
    const messagesQuery = query(collection(ref, 'messages'));

    const messagesSnapshotListener = onSnapshot(
        messagesQuery,
        (querySnapshot) => {
            const data: any[] = [];
            querySnapshot.forEach((doc: any) => {
                data.push({ ...doc.data(), id: doc.id });
            });
            const messages = data.reduce(
                (obj: any, message: any): any => ({
                    ...obj,
                    [message.id]: Message.create(message)
                }),
                {}
            );
            dispatch(
                dataLayerActions.messageFetchSuccessful({
                    [uid || '']: messages
                })
            );
        },
        (error: Error) => {
            // eslint-disable-next-line no-console
            console.error('setupMessageListener Error', error);
            // TODO : Handle the error
        }
    );
    addListener(`message_${uid || ''}_messages`, messagesSnapshotListener);
    // const ref = db.collection(`messages/${ uid || "" }/messages`);

    // addListener(`message_${ uid || "" }_messages`, ref.onSnapshot(
    //     (querySnapshot: QuerySnapshot) => {
    //         const data = [];
    //         querySnapshot.forEach((doc: Object) => {
    //             data.push({ ...doc.data(), id: doc.id });
    //         });
    //         const messages = data.reduce((obj: Object, message: MessageType): Object => ({
    //             ...obj,
    //             [message.id]: Message.create(message)
    //         }), {});
    //         dispatch(dataLayerActions.messageFetchSuccessful({ [uid || ""]: messages }));
    //     },
    //     ((error: Error) => {
    //         // eslint-disable-next-line no-console
    //         console.error("setupMessageListener Error", error);
    //         // TODO : Handle the error
    //     })
    // ));
}

function setupTeamMemberListener(
    teamIds: Array<string> = [],
    dispatch: Dispatch<Action>
) {
    const addTeamMemberListener = (teamId: string) => {
        const teamRef = doc(firestore, `teams/${teamId}`);
        const membersQuery = query(collection(teamRef, 'members'));

        const memberListener = onSnapshot(
            membersQuery,
            (querySnapshot) => {
                const data: any[] = [];
                querySnapshot.forEach((_doc: any) => {
                    data.push({ ..._doc.data(), id: _doc.id });
                });
                const members = data.reduce(
                    (obj: any, member: any): any => ({
                        ...obj,
                        [member.uid]: member
                    }),
                    {}
                );
                dispatch(
                    dataLayerActions.teamMemberFetchSuccessful(members, teamId)
                );
            },
            (error: string | Object) => {
                // eslint-disable-next-line no-console
                console.error('setupTeamMemberListener Error', error);
                // TODO : Handle the error
            }
        );
        addListener(`team_${teamId}_members`, memberListener);
    };

    (teamIds || []).forEach((teamId: string) => {
        addTeamMemberListener(teamId);
    });

    // const addTeamMemberListener = (teamId: string) => {
    //     addListener(`team_${ teamId }_members`, db.collection(`teams/${ teamId }/members`)
    //         .onSnapshot(
    //             (querySnapshot: QuerySnapshot) => {
    //                 const data = [];
    //                 querySnapshot.forEach((_doc: Object) => {
    //                     data.push({ ..._doc.data(), id: _doc.id });
    //                 });
    //                 const members = data.reduce((obj: Object, member: TeamMemberType): Object => (
    //                     {
    //                         ...obj,
    //                         [member.uid]: member
    //                     }
    //                 ), {});
    //                 dispatch(dataLayerActions.teamMemberFetchSuccessful(members, teamId));
    //             },
    //             ((error: string | Object) => {
    //                 // eslint-disable-next-line no-console
    //                 console.error("setupTeamMemberListener Error", error);
    //                 // TODO : Handle the error
    //             })
    //         ));
    // };

    // (teamIds || []).forEach((teamId: string) => {
    //     addTeamMemberListener(teamId);
    // });
}

function setupTeamRequestListener(
    teamIds: Array<string>,
    dispatch: Dispatch<Action>
) {
    (teamIds || []).map((teamId: string): void => {
        const teamRef = doc(firestore, `teams/${teamId}`);
        const requestsQuery = query(collection(teamRef, 'requests'));

        const teamRequestListener = onSnapshot(
            requestsQuery,
            (querySnapshot) => {
                const data: any[] = [];
                querySnapshot.forEach((_doc: any) => {
                    data.push({ ..._doc.data(), id: _doc.id });
                });
                const members = data.reduce(
                    (obj: any, member: any): any => ({
                        [member.uid]: member
                    }),
                    {}
                );
                dispatch(
                    dataLayerActions.teamRequestFetchSuccessful(members, teamId)
                );
            },
            (error: Error) => {
                // eslint-disable-next-line no-console
                console.error('setupTeamRequestListener Error', error);
                // TODO : Handle the error
            }
        );
        addListener(`team_${teamId}_requests`, teamRequestListener);
        // addListener(`team_${ teamId }_requests`,
        //     db.collection(`teams/${ teamId }/requests`).onSnapshot(
        //         (querySnapshot: QuerySnapshot) => {
        //             const data = [];
        //             querySnapshot.forEach((_doc: Object) => {
        //                 data.push({ ..._doc.data(), id: _doc.id });
        //             });
        //             const members = data.reduce((obj: Object, member: TeamMemberType): Object => ({
        //                 ...obj,
        //                 [member.uid]: member
        //             }), {});
        //             dispatch(dataLayerActions.teamRequestFetchSuccessful(members, teamId));
        //         },
        //         ((error: Error) => {
        //             // eslint-disable-next-line no-console
        //             console.error("setupTeamRequestListener Error", error);
        //             // TODO : Handle the error
        //         })
        //     )
        // )
    });
}

function setupTeamMessageListener(
    teamIds: Array<string>,
    dispatch: Dispatch<Action>
) {
    (teamIds || []).map((teamId: string) => {
        const teamRef = doc(firestore, `teams/${teamId}`);
        const teamMessageQuery = query(collection(teamRef, 'messages'));

        const teamMessageListener = onSnapshot(
            teamMessageQuery,
            (querySnapshot) => {
                const data: any[] = [];
                querySnapshot.forEach((doc: any) => {
                    data.push({ ...doc.data(), id: doc.id });
                });
                const messages = data.reduce(
                    (obj: any, message: any): any => ({
                        ...obj,
                        [message.id]: Message.create(message)
                    }),
                    {}
                );
                dispatch(
                    dataLayerActions.messageFetchSuccessful({
                        [teamId]: messages
                    })
                );
            },
            (error: Error) => {
                // eslint-disable-next-line no-console
                console.error(
                    `setupTeamMessageListener Error for team ${teamId}`,
                    error
                );
                // TODO : Handle the error
            }
        );
        addListener(`team_${teamId}_messages`, teamMessageListener);
        // const ref = db.collection(`teams/${ teamId }/messages`);

        // addListener(`team_${ teamId }_messages`, ref.onSnapshot(
        //     ((querySnapshot: QuerySnapshot) => {
        //         const data = [];
        //         querySnapshot.forEach((doc: Object) => {
        //             data.push({ ...doc.data(), id: doc.id });
        //         });
        //         const messages = data.reduce((obj: Object, message: MessageType): Object => (
        //             {
        //                 ...obj,
        //                 [message.id]: Message.create(message)
        //             }
        //         ), {});
        //         dispatch(dataLayerActions.messageFetchSuccessful({ [teamId]: messages }));
        //     }),
        //     ((error: Error) => {
        //         // eslint-disable-next-line no-console
        //         console.error(`setupTeamMessageListener Error for team ${ teamId }`, error);
        //         // TODO : Handle the error
        //     })
        // ));
    });
}

function setupProfileListener(user: User, dispatch: Dispatch<Action>) {
    const { uid } = user;
    const docRef = doc(firestore, `profiles/${uid}`);

    const gotSnapshot = (doc: any) => {
        if (doc.exists) {
            const data = doc.data();
            dispatch({ type: actionTypes.FETCH_PROFILE_SUCCESS, data });
        } else {
            // just in case
            createProfile(user, dispatch);
        }
    };

    addListener(
        `profiles_${uid || ''}`,
        onSnapshot(docRef, { next: gotSnapshot })
    );
    // const { uid } = user;

    // addListener(`profiles_${ uid || "" }`, db.collection("profiles").doc(uid)
    //     .onSnapshot((doc: Object) => {
    //         if (doc.exists) {
    //             const data = doc.data();
    //             dispatch({ type: actionTypes.FETCH_PROFILE_SUCCESS, data });
    //         } else {
    //             // just in case
    //             createProfile(user, dispatch);
    //         }
    //     }));
}

function setupMyTeamsListener(user: User, dispatch: Dispatch<Action>) {
    const { uid } = user;
    const ref = doc(firestore, `profiles/${uid || ''}`);
    const teamsQuery = query(collection(ref, 'teams'));

    const gotSnapshot = (querySnapshot: any) => {
        const data: any[] = [];
        querySnapshot.forEach((doc: any) => {
            data.push({ ...doc.data(), id: doc.id });
        });
        const myTeams = data.reduce(
            (obj: any, team: any): any => ({ ...obj, [team.id]: team }),
            {}
        );
        dispatch({ type: actionTypes.FETCH_MY_TEAMS_SUCCESS, data: myTeams });
        const joinedTeams = data
            .filter((team: Team): boolean => Boolean(team.id && team.isMember))
            .map((team: Team): string => team.id || '');
        setupTeamMessageListener(joinedTeams, dispatch);
        setupTeamMemberListener(joinedTeams, dispatch);
        // Add additional listeners for team owners
        const ownedTeamIds = data
            .filter((team: Team): boolean =>
                Boolean(team.id && team.owner && team.owner.uid === uid)
            )
            .map((team: Team): string => team.id || '');
        setupInvitedTeamMemberListener(ownedTeamIds, dispatch);
        setupTeamRequestListener(ownedTeamIds, dispatch);
    };

    const snapShotError = (error: Error) => {
        // eslint-disable-next-line no-console
        console.error('setupMyTeamsListener error', error);
        setTimeout(() => {
            dispatch({ type: actionTypes.FETCH_MY_TEAMS_FAIL, error });
        }, 1);
    };

    const myTeamsSnapshotListener = onSnapshot(teamsQuery, {
        next: gotSnapshot,
        error: snapShotError
    });
    addListener('myTeams', myTeamsSnapshotListener);
    // const { uid } = user;

    // const gotSnapshot = (querySnapshot: Object) => {
    //     const data = [];
    //     querySnapshot.forEach((doc: Object) => {
    //         data.push({ ...doc.data(), id: doc.id });
    //     });
    //     const myTeams = data.reduce((obj: Object, team: TeamType): Object => ({ ...obj, [team.id]: team }), {});
    //     dispatch({ type: actionTypes.FETCH_MY_TEAMS_SUCCESS, data: myTeams });
    //     const joinedTeams = data
    //         .filter((team: TeamType): boolean => Boolean(team.id && team.isMember))
    //         .map((team: TeamType): string => (team.id || ""));
    //     setupTeamMessageListener(joinedTeams, dispatch);
    //     setupTeamMemberListener(joinedTeams, dispatch);
    //     // Add additional listeners for team owners
    //     const ownedTeamIds = data
    //         .filter((team: TeamType): boolean => Boolean(team.id && team.owner && team.owner.uid === uid))
    //         .map((team: TeamType): string => (team.id || ""));
    //     setupInvitedTeamMemberListener(ownedTeamIds, dispatch);
    //     setupTeamRequestListener(ownedTeamIds, dispatch);
    // };

    // const snapShotError = (error: Error) => {
    //     // eslint-disable-next-line no-console
    //     console.error("setupMyTeamsListener error", error);
    //     setTimeout(() => {
    //         dispatch({ type: actionTypes.FETCH_MY_TEAMS_FAIL, error });
    //     }, 1);
    // };

    // addListener("myTeams", db.collection(`profiles/${ (uid || "") }/teams`).onSnapshot(gotSnapshot, snapShotError));
}

// Nick added this to explore why trash drop pins did not show up on the map when they were dropped
// while the device was offline. Upon adding this, Nick found that the map started showing dropped pins
// immediatley. So this listener appears to trigger a refresh on state or something. Nick does not
// entirely know why this works, but is presently ok with that.
function setupTrashDropListener(user: User, dispatch: Dispatch<Action>) {
    const { uid } = user;

    const gotSnapshot = (querySnapshot: any) => {
        const data: any[] = [];
        console.log('trash drop listener - got snapshot');
        querySnapshot.forEach((doc: any) => {
            data.push({ ...doc.data(), id: doc.id });
        });
        const trashDrops = data.reduce(
            (obj: any, drop: any): any => ({ ...obj, [drop.id]: drop }),
            {}
        );
        dispatch({
            type: actionTypes.FETCH_TRASH_DROPS_SUCCESS,
            data: trashDrops
        });
    };

    const snapShotError = (error: Error) => {
        // eslint-disable-next-line no-console
        console.error('setupTrashDropListener error', error);
        setTimeout(() => {
            dispatch({ type: actionTypes.FETCH_TRASH_DROPS_FAIL, error });
        }, 1);
    };

    const trashDropsQuery = query(collection(firestore, 'trashDrops'));
    const unsubscribe = onSnapshot(trashDropsQuery, gotSnapshot, snapShotError);
    addListener('trashDrops', unsubscribe);

    // addListener("trashDrops", db.collection(`trashDrops`).onSnapshot(gotSnapshot, snapShotError));
}

// Fetch Trash Drops Data
export const fetchTrashDrops = getCollection(
    TrashDrop,
    'trashDrops',
    actionTypes.FETCH_TRASH_DROPS_SUCCESS,
    actionTypes.FETCH_TRASH_DROPS_FAIL
);

// Fetch Town Data
export const fetchTowns = async () => {
    const collectionRef = collection(firestore, 'towns');
    const querySnapshot = await getDocs(collectionRef);
    const data: any = {};
    querySnapshot.forEach((doc: any) => {
        data[doc.id] = Town.create(doc.data(), doc.id);
    });
    return data;
};

export const getTownById = async (townId: string) => {
    const townRef = doc(firestore, 'towns', townId);
    const town = await getDoc(townRef);
    return town.data();
};

// Fetch TrashCollectionSite Data
export const fetchTrashCollectionSites = async () => {
    const collectionRef = collection(firestore, 'trashCollectionSites');
    const querySnapshot = await getDocs(collectionRef);
    const data: any = {};
    querySnapshot.forEach((doc: any) => {
        data[doc.id] = TrashCollectionSite.create(doc.data(), doc.id);
    });
    return data;
};

// Fetch Celebrations Data
export const fetchCelebrations = getCollection(
    Celebration,
    'celebrations',
    actionTypes.FETCH_CELEBRATIONS_SUCCESS,
    actionTypes.FETCH_CELEBRATIONS_FAIL
);

// Fetch Teams Data
export const getPublicTeams = async () => {
    const collectionRef = collection(firestore, 'teams');
    const q = query(collectionRef, where('isPublic', '==', true));
    const querySnapshot = await getDocs(q);
    const data: any = {};
    querySnapshot.forEach((doc: any) => {
        data[doc.id] = Team.create(doc.data(), doc.id);
    });
    return data;
};

// Fetch Green Up Event Info
export async function fetchEventInfo(dispatch: Dispatch<Action>) {
    try {
        const docSnapshot = await getDoc(
            doc(firestore, 'eventInfo', 'settings')
        );
        if (!docSnapshot.exists()) {
            throw Error('Failed to retrieve event info');
        }
        dispatch({
            type: actionTypes.FETCH_EVENT_INFO_SUCCESS,
            data: docSnapshot.data()
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error getting event info:', JSON.stringify(error));
    }

    // db.collection("eventInfo").doc("settings").get().then(
    //     (doc: Object) => {
    //         if (!doc.exists) {
    //             throw Error("Failed to retrieve event info");
    //         }
    //         dispatch({ type: actionTypes.FETCH_EVENT_INFO_SUCCESS, data: doc.data() });

    //     }).catch(
    //     (error: Object) => {
    //         // eslint-disable-next-line no-console
    //         console.error("Error getting event info:", JSON.stringify(error));
    //     }
    // );
}

// Fetch SupplyDistributionSite Data
export const fetchSupplyDistributionSites = async () => {
    const collectionRef = collection(firestore, 'supplyDistributionSites');
    const querySnapshot = await getDocs(collectionRef);
    const data: any = {};
    querySnapshot.forEach((doc: any) => {
        data[doc.id] = SupplyDistributionSite.create(doc.data(), doc.id);
    });
    return data;
};

function setupUpdatesListener(dispatch: Dispatch<Action>) {
    const gotSnapShot = (querySnapshot: any) => {
        const data: any = {};
        querySnapshot.forEach((doc: any) => {
            const updated = doc.data() || {};
            data[doc.id] = (updated.updated || {}).seconds;
        });
        setTimeout(() => {
            dispatch({ type: actionTypes.FETCH_UPDATES_SUCCESS, data });
        }, 1);
    };

    const snapShotError = (error: Error) => {
        // eslint-disable-next-line no-console
        console.error('Error in setupUpdatesListener: ', error);
        setTimeout(() => {
            dispatch({ type: actionTypes.FETCH_UPDATES_FAIL, error });
        }, 1);
    };
    const updateCollectionRef = collection(firestore, 'updates');

    addListener(
        'updates',
        onSnapshot(updateCollectionRef, {
            next: gotSnapShot,
            error: snapShotError
        })
    );
    // const gotSnapShot = (querySnapshot: QuerySnapshot) => {
    //     const data = {};
    //     querySnapshot.forEach((doc: Object) => {
    //         const updated = (doc.data() || {});
    //         data[doc.id] = (updated.updated || {}).seconds;
    //     });
    //     setTimeout(() => {
    //         dispatch({ type: actionTypes.FETCH_UPDATES_SUCCESS, data });
    //     }, 1);
    // };

    // const snapShotError = (error: Error) => {
    //     // eslint-disable-next-line no-console
    //     console.error("Error in setupUpdatesListener: ", error);
    //     setTimeout(() => {
    //         dispatch({ type: actionTypes.FETCH_UPDATES_FAIL, error });
    //     }, 1);
    // };
    // addListener("updates", db.collection("updates").onSnapshot(gotSnapShot, snapShotError));
}

// Initialize or de-initialize a user
const initializeUser = R.curry((dispatch: Dispatch<Action>, user: User) => {
    setupUpdatesListener(dispatch);
    // fetchEventInfo(dispatch);
    setupProfileListener(user, dispatch);
    // setupTrashDropListener(dispatch);
    setupInvitationListener(user.email, dispatch);
    // setupCelebrationsListener(dispatch);
    // setupTownListener(dispatch);
    //  setupTrashCollectionSiteListener(dispatch);
    // setupSupplyDistributionSiteListener(dispatch);
    // setupTeamsListener(user, dispatch);
    setupMessageListener(user.uid, dispatch);
    setupMyTeamsListener(user, dispatch);
    setupTrashDropListener(user, dispatch); // Nick added this as part of trying to get map pins on the map during offline mode.
    // dispatch({ type: actionTypes.IS_LOGGING_IN_VIA_SSO, isLoggingInViaSSO: false });
});

const deinitializeUser = () => {
    removeAllListeners();
};

/**
 * Sets up a listener that initializes the user after login, or resets app state after a logout.
 * @param {function} dispatch - dispatch function
 * @returns {void}
 */
export function initialize(dispatch: Dispatch<Action>) {
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
        initializeUser(dispatch)(User.create(currentUser));
    }

    firebaseAuth.onAuthStateChanged((user: any) => {
        if (user) {
            initializeUser(dispatch)(User.create(user));
            dispatch(dataLayerActions.userAuthenticated(User.create(user)));
        } else {
            deinitializeUser();
            dispatch(dataLayerActions.userLoggedOut());
        }
    });
}

/** *************** AUTHENTICATION *************** **/

export async function createUser(
    email: string,
    password: string,
    displayName: string,
    dispatch: Dispatch<Action>
): Promise<any> {
    const myEmail = (email || '').trim(); // Android adds an extra space on autofill;
    const response = await createUserWithEmailAndPassword(
        firebaseAuth,
        myEmail,
        password
    );

    createProfile(
        {
            ...User.create(response.user),
            displayName: displayName || response.user.displayName || ''
        },
        dispatch
    );

    return updateProfileFirebase(response.user, {
        displayName: displayName || response.user.displayName,
        photoURL: response.user.photoURL || defaultGravatar
    });
    // const myEmail = (email || "").trim(); // Android adds an extra space on autofill;
    // return firebase
    //     .auth()
    //     .createUserWithEmailAndPassword(myEmail, password).then(
    //         (response: Object): Promise<any> => {
    //             createProfile({
    //                 ...User.create(response.user),
    //                 displayName: displayName || response.user.displayName
    //             }, dispatch);
    //             return response.user.updateProfile({
    //                 displayName: displayName || response.user.displayName,
    //                 photoURL: response.user.photoURL || defaultGravatar
    //             });
    //         }
    //     );
}

export async function loginWithEmailPassword(
    _email: string,
    password: string,
    dispatch: Dispatch<Action>
): Promise<any> {
    const myEmail = (_email || '').trim(); // Android adds an extra space on autofill;
    const userInfo = await signInWithEmailAndPassword(
        firebaseAuth,
        myEmail,
        password
    );
    const { uid, email, displayName, photoURL } = userInfo.user;
    const docRef = doc(firestore, 'profiles', uid);

    const userDoc = await getDoc(docRef);

    try {
        if (!userDoc.exists) {
            createProfile(
                User.create({ uid, email, displayName, photoURL }),
                dispatch
            );
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error getting document:', error);
    }
    return userInfo;
}

// const myEmail = (_email || "").trim(); // Android adds an extra space on autofill;
// return firebase
//     .auth()
//     .signInWithEmailAndPassword(myEmail, password)
//     .then((userInfo: { user: UserType }) => {
//         const { uid, email, displayName, photoURL } = userInfo.user;
//         db.collection("profiles").doc(uid).get().then(
//             (doc: Object) => {
//                 if (!doc.exists) {
//                     createProfile(User.create({ uid, email, displayName, photoURL }), dispatch);
//                 }
//             }).catch((error: Error) => {
//             // eslint-disable-next-line no-console
//             console.error("Error getting document:", error);
//         });
//     });

export async function resetPassword(emailAddress: string): Promise<any> {
    await sendPasswordResetEmail(firebaseAuth, emailAddress);
}

export function logout(dispatch: Dispatch<Action>): Promise<any> {
    removeAllListeners();
    dispatch(dataLayerActions.resetData());
    return firebaseAuth.signOut();
}

export async function updateEmail(email: string): Promise<any> {
    await updateEmailFirebase(firebaseAuth.currentUser as any, email);
}

/** *************** MESSAGING *************** **/

export async function sendUserMessage(
    userId: string,
    message: Message
): Promise<any> {
    const _message = deconstruct(stringifyDates(message));
    const messagesCollection = collection(
        firestore,
        `messages/${userId}/messages`
    );
    await addDoc(messagesCollection, _message);

    // const _message = deconstruct(stringifyDates(message));
    // return db.collection(`messages/${ userId }/messages`).add(_message);
}

export function sendGroupMessage(
    group: Array<Object>,
    message: Message
): Promise<Array<any>> {
    const sentMessages = group.map(
        (recipient: User): Promise<any> =>
            recipient.uid
                ? sendUserMessage(recipient.uid, deconstruct(message))
                : Promise.reject('Invalid User')
    );
    return Promise.all(sentMessages);
}

export async function sendTeamMessage(
    teamId: string,
    message: Message
): Promise<any> {
    const messagesCollection = collection(
        firestore,
        `teams/${teamId}/messages`
    );
    await addDoc(messagesCollection, deconstruct(message));

    // return db.collection(`teams/${ teamId }/messages`).add(deconstruct(message));
}

export async function updateMessage(
    message: Message,
    userId: string
): Promise<any> {
    const newMessage = deconstruct({
        ...message,
        sender: { ...message.sender }
    });
    const messageDoc = doc(
        firestore,
        `messages/${userId}/messages`,
        message.id!
    );
    await setDoc(messageDoc, newMessage);
    // const newMessage = deconstruct({ ...message, sender: { ...message.sender } });
    // return db.collection(`messages/${ userId }/messages`).doc(message.id).set(newMessage);
}

export async function deleteMessage(
    userId: string,
    messageId: string
): Promise<any> {
    const messageDoc = doc(firestore, `messages/${userId}/messages`, messageId);
    await deleteDoc(messageDoc);
    // return db.collection(`messages/${ userId }/messages`).doc(messageId).delete();
}

/** *************** TEAMS *************** **/

export async function createTeam(
    team: Object = {},
    user: any,
    dispatch: Dispatch<Action>
): Promise<any> {
    const { uid } = user;
    const owner = TeamMember.create({ ...user, memberStatus: 'OWNER' });
    const myTeam = deconstruct({ ...team, owner });

    const collectionRef = collection(firestore, 'teams');
    const docRef = await addDoc(collectionRef, myTeam);

    // TODO: Refactor to single Promise.all that is returned.
    await Promise.all([
        setDoc(doc(firestore, `teams/${docRef.id}/members`, owner.uid!), owner),
        // db.collection(`teams/${ docRef.id }/members`).doc(owner.uid).set(owner),
        setDoc(doc(firestore, `profiles/${uid}/teams`, docRef.id), {
            ...myTeam,
            isMember: true
        })
        // db.collection(`profiles/${ uid }/teams`).doc(docRef.id).set({ ...myTeam, isMember: true })
    ]);

    setupTeamMemberListener([docRef.id], dispatch);
    setupTeamMessageListener([docRef.id], dispatch);

    // const { uid } = (user || {});
    // const owner = TeamMember.create({ ...user, memberStatus: "OWNER" });
    // const myTeam = deconstruct({ ...team, owner });

    // const docRef = await db.collection("teams").add(myTeam);
    // // TODO: Refactor to single Promise.all that is returned.
    // await Promise.all([
    //     db.collection(`teams/${ docRef.id }/members`).doc(owner.uid).set(owner),
    //     db.collection(`profiles/${ uid }/teams`).doc(docRef.id).set({ ...myTeam, isMember: true })
    // ]);

    // setupTeamMemberListener([docRef.id], dispatch);
    // setupTeamMessageListener([docRef.id], dispatch);
}

export async function saveTeam(team: Team): Promise<any> {
    const _team = deconstruct({ ...team, owner: { ...team.owner } });
    await setDoc(
        //doc(firestore, `teams/${ team.id }`, docRef.id),
        doc(firestore, `teams/${team.id}`),
        _team
    );
    // return db.collection("teams").doc(team.id).set(_team);
}

export async function deleteTeam(teamId: string): Promise<any> {
    let members = [];
    const getTeamsRef = collection(firestore, `teams/${teamId}/members`);
    try {
        const snapshot = await getDocs(getTeamsRef);
        snapshot.forEach((doc: any) => {
            console.log(doc.data());
            removeTeamMember(teamId, doc.data());
        });
    } catch (error) {
        console.log('error: ' + error);
    }
    await deleteDoc(doc(firestore, 'teams', teamId));
    // return db.collection("teams").doc(teamId).delete();
}

export async function saveLocations(
    locations: any,
    teamId: string
): Promise<any> {
    const teamDoc = doc(firestore, 'teams', teamId);
    await updateDoc(teamDoc, {
        locations: deconstruct({ ...locations }) as any
    });

    // return db.collection("teams").doc(teamId).update({ locations: deconstruct({ ...locations }) });
}

export async function getTeamMembers(teamId: string): Promise<any> {
    const getTeamsRef = collection(firestore, `teams/${teamId}/members`);
    try {
        const snapshot = await getDocs(getTeamsRef);
        const teamMembers: any = {};
        snapshot.docs.forEach((doc: any) => {
            teamMembers[doc.id] = TeamMember.create(doc.data());
        });
        return teamMembers;
    } catch (error) {
        console.log('error: ' + error);
    }
}

export async function inviteTeamMember(invitation: any): Promise<any> {
    const membershipId = invitation.teamMember.email.toLowerCase();
    const team = { ...invitation.team, owner: { ...invitation.team.owner } };
    const sender = { ...invitation.sender };
    const teamMember = { ...invitation.teamMember };
    const invite = { ...invitation, teamMember, team, sender };

    const invitationDoc = doc(
        firestore,
        `invitations/${membershipId}/teams`,
        team.id
    );
    const setInvitation = setDoc(invitationDoc, { ...invite });

    const teamInvitationDoc = doc(
        firestore,
        `teams/${team.id}/invitations`,
        membershipId
    );
    const setTeamInvitation = setDoc(
        teamInvitationDoc,
        deconstruct({ ...invitation.teamMember })
    );

    await Promise.all([setInvitation, setTeamInvitation]);

    // const membershipId = invitation.teamMember.email.toLowerCase();
    // const team = { ...invitation.team, owner: { ...invitation.team.owner } };
    // const sender = { ...invitation.sender };
    // const teamMember = { ...invitation.teamMember };
    // const invite = { ...invitation, teamMember, team, sender };
    // return db
    //     .collection(`invitations/${ membershipId }/teams`)
    //     .doc(team.id)
    //     .set({ ...invite })
    //     .then(db.collection(`teams/${ team.id }/invitations`).doc(membershipId).set(deconstruct({ ...invitation.teamMember })));
}

export async function removeInvitation(
    teamId: string,
    email: string
): Promise<any> {
    const emailLower = email.toLowerCase().trim();
    const deleteInvitation = deleteDoc(
        doc(firestore, `invitations/${emailLower}/teams`, teamId)
    );
    const deleteTeamRecord = deleteDoc(
        doc(firestore, `teams/${teamId}/invitations`, emailLower)
    );
    await Promise.all([deleteInvitation, deleteTeamRecord]);
}

// const deleteInvitation = db.collection(`invitations/${ email }/teams`).doc(teamId).delete();
// const deleteTeamRecord = db.collection(`teams/${ teamId }/invitations`).doc(email.toLowerCase().trim()).delete();
// return Promise.all([deleteInvitation, deleteTeamRecord]);

export async function addTeamMember(
    teamId: string,
    user: any,
    status: string = 'ACCEPTED',
    dispatch: Dispatch<Action>
): Promise<any> {
    const email = user.email.toLowerCase().trim();
    const teamMember = TeamMember.create(
        Object.assign({}, user, { memberStatus: status })
    );

    const teamMemberDoc = doc(
        firestore,
        `teams/${teamId}/members`,
        teamMember.uid!
    );
    try {
        await setDoc(teamMemberDoc, teamMember);
    } catch (error) {
        console.log('Error adding team member:', error);
    }

    const myteamRef = doc(firestore, 'teams', teamId);
    let myteam = {} as any;
    try {
        const thedoc = await getDoc(myteamRef);
        if (thedoc.exists()) {
            myteam = thedoc.data();
            console.log('Document data:', myteam);
            const profileDoc = doc(
                firestore,
                `profiles/${user.uid}/teams`,
                teamId
            );
            const teamInfoToAdd = { ...myteam, isMember: true };
            console.log('myteam', myteam);
            console.log('teamInfoToAdd', teamInfoToAdd);
            await setDoc(profileDoc, teamInfoToAdd);
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.log('Error getting document:', error);
    }

    const removeRequestDoc = doc(
        firestore,
        `teams/${teamId}/requests`,
        teamMember.uid!
    );
    await deleteDoc(removeRequestDoc);
    await removeInvitation(teamId, email);

    if (dispatch) {
        // If dispatch is defined we are adding current user and need to setup listeners. TODO: Fix this hack.
        setupTeamMemberListener([teamId], dispatch);
        setupTeamMessageListener([teamId], dispatch);
    }
}

export async function updateTeamMember(
    teamId: string,
    teamMember: TeamMember
): Promise<any> {
    const collectionRef = collection(firestore, `teams/${teamId}/members`);
    const docRef = doc(collectionRef, teamMember.uid!);
    await setDoc(docRef, deconstruct({ ...teamMember }));
}

export async function removeTeamMember(
    teamId: string,
    teamMember: User
): Promise<any> {
    console.log(
        'Removed Team Member ' + teamMember.uid + ' from team ' + teamId
    );
    const deleteFromTeam = deleteDoc(
        doc(firestore, `teams/${teamId}/members`, teamMember.uid!)
    );
    const deleteFromProfile = deleteDoc(
        doc(firestore, `profiles/${teamMember.uid || ''}/teams`, teamId)
    );
    const deleteFromInvites = deleteDoc(
        doc(firestore, `invitations`, teamMember.email!)
    );
    await Promise.all([deleteFromTeam, deleteFromProfile]);
}

export async function leaveTeam(
    teamId: string,
    teamMember: User
): Promise<any> {
    const teams: any = { ...teamMember.teams };
    delete teams[teamId];
    const memberDoc = doc(
        firestore,
        `teams/${teamId}/members`,
        teamMember.uid!
    );
    const removeMember = deleteDoc(memberDoc);
    const teamDoc = doc(
        firestore,
        `profiles/${teamMember.uid || ''}/teams`,
        teamId
    );
    const removeTeam = deleteDoc(teamDoc);
    await Promise.all([removeMember, removeTeam]);

    // const teams = { ...teamMember.teams };
    // delete teams[teamId];
    // const removeMember = db.collection(`teams/${ teamId }/members`).doc(teamMember.uid).delete();
    // const removeTeam = db.collection(`profiles/${ teamMember.uid || "" }/teams`).doc(teamId).delete();
    // return Promise.all([removeMember, removeTeam]);
}

export async function revokeInvitation(
    teamId: string,
    membershipId: string
): Promise<any> {
    const _membershipId = membershipId.toLowerCase();
    const teamListing = deleteDoc(
        doc(firestore, `teams/${teamId}/invitations`, _membershipId)
    );
    const invite = deleteDoc(
        doc(firestore, `invitations/${_membershipId}/teams`, teamId)
    );
    await Promise.all([teamListing, invite]);
    // const _membershipId = membershipId.toLowerCase();
    // const teamListing = db.collection(`teams/${ teamId }/invitations`).doc(_membershipId).delete();
    // const invite = db.collection(`invitations/${ _membershipId }/teams`).doc(teamId).delete();
    // return Promise.all([teamListing, invite]);
}

export async function addTeamRequest(teamId: string, user: any): Promise<any> {
    const email = user.email.toLowerCase().trim();
    const teamMember = TeamMember.create(
        Object.assign({}, user, { memberStatus: teamStatuses.REQUEST_TO_JOIN })
    );
    const teamRequestDoc = doc(firestore, `teams/${teamId}/requests`, user.uid);
    const teamRequest = setDoc(teamRequestDoc, deconstruct(teamMember));
    const profileDoc = doc(firestore, `profiles/${user.uid}/teams`, teamId);
    const addTeamToProfile = setDoc(profileDoc, { isMember: false });
    await Promise.all([teamRequest, addTeamToProfile]);
    await removeInvitation(teamId, email);

    // const email = user.email.toLowerCase().trim();
    // const teamMember = TeamMember.create(Object.assign({}, user, { memberStatus: teamStatuses.REQUEST_TO_JOIN }));
    // const teamRequest = db.collection(`teams/${ teamId }/requests`).doc(user.uid).set(deconstruct(teamMember));
    // const addTeamToProfile = db.collection(`profiles/${ user.uid }/teams`).doc(teamId).set({ isMember: false });
    // return Promise.all([teamRequest, addTeamToProfile]).then((): Promise<any> => removeInvitation(teamId, email));
}

export async function removeTeamRequest(
    teamId: string,
    teamMember: User
): Promise<any> {
    const teams: any = { ...teamMember.teams };
    delete teams[teamId];
    const teamRequestDoc = doc(
        firestore,
        `teams/${teamId}/requests`,
        teamMember.uid!
    );
    const delRequest = deleteDoc(teamRequestDoc);
    const profileDoc = doc(
        firestore,
        `profiles/${teamMember.uid || ''}/teams`,
        teamId
    );
    const delFromProfile = deleteDoc(profileDoc);
    await Promise.all([delRequest, delFromProfile]);

    // const teams = { ...teamMember.teams };
    // delete teams[teamId];
    // const delRequest = db.collection(`teams/${ teamId }/requests`).doc(teamMember.uid).delete();
    // const delFromProfile = db.collection(`profiles/${ teamMember.uid || "" }/teams/`).doc(teamId).delete();
    // return Promise.all([delRequest, delFromProfile]);
}

/** *************** TRASH DROPS *************** **/

export async function dropTrash(trashDrop: TrashDrop): Promise<any> {
    let newDrop = deconstruct({
        ...trashDrop,
        location: {
            ...trashDrop.location
        }
    });

    await addDoc(collection(firestore, 'trashDrops'), newDrop);
    // return db.collection("trashDrops").add(newDrop);
}

export async function updateTrashDrop(trashDrop: TrashDrop): Promise<any> {
    await setDoc(
        doc(firestore, 'trashDrops', trashDrop.id!),
        deconstruct({
            ...trashDrop,
            location: { ...trashDrop.location }
        })
    );

    // return db.collection("trashDrops").doc(trashDrop.id).set(deconstruct({
    //     ...trashDrop,
    //     location: { ...trashDrop.location }
    // }));
}

export async function removeTrashDrop(trashDrop: TrashDrop): Promise<any> {
    await deleteDoc(doc(firestore, 'trashDrops', trashDrop.id!));
    // return db.collection("trashDrops").doc(trashDrop.id).delete();
}
