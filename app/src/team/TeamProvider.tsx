import React, {useCallback, useContext, useEffect, useReducer, useState} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {TeamProps} from './TeamProps';
import {createTeam, deleteTeam, getTeams, newWebSocket, syncData, updateTeam} from './teamApi';
import {AuthContext} from "../auth";
import {Network, Storage} from "@capacitor/core";
import {useMyLocation} from "../hooks/useMyLocation";

const log = getLogger('TeamProvider');

type SaveTeamFn = (team: TeamProps) => Promise<any>;
type DeleteTeamFn = (team: TeamProps) => Promise<any>;

export interface TeamsState {
    teams?: TeamProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveTeam?: SaveTeamFn,
    deleting: boolean,
    deletingError?: Error | null,
    deleteTeam?: DeleteTeamFn,
    connectedNetwork?: boolean,
    setSavedOffline?: Function,
    savedOffline?: boolean
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: TeamsState = {
    fetching: false,
    saving: false,
    deleting: false
};

const FETCH_TEAMS_STARTED = 'FETCH_TEAMS_STARTED';
const FETCH_TEAMS_SUCCEEDED = 'FETCH_TEAMS_SUCCEEDED';
const FETCH_TEAMS_FAILED = 'FETCH_TEAMS_FAILED';
const SAVE_TEAM_STARTED = 'SAVE_TEAM_STARTED';
const SAVE_TEAM_SUCCEEDED = 'SAVE_TEAM_SUCCEEDED';
const SAVE_TEAM_FAILED = 'SAVE_TEAM_FAILED';
const DELETE_TEAM_STARTED = 'DELETE_TEAM_STARTED';
const DELETE_TEAM_SUCCEEDED = 'DELETE_TEAM_SUCCEEDED';
const DELETE_TEAM_FAILED = 'DELETE_TEAM_FAILED';


const reducer: (state: TeamsState, action: ActionProps) => TeamsState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_TEAMS_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_TEAMS_SUCCEEDED:
                return {...state, teams: payload.teams, fetching: false};
            case FETCH_TEAMS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_TEAM_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_TEAM_SUCCEEDED: {
                const teams = [...(state.teams || [])];
                const team = payload.team;
                const index = teams.findIndex(it => it._id === team._id);
                if (index === -1) {
                    teams.splice(0, 0, team);
                } else {
                    teams[index] = team;
                }
                return {...state, teams: teams, saving: false};
            }
            case SAVE_TEAM_FAILED:
                return {...state, savingError: payload.error, saving: false};
            case DELETE_TEAM_STARTED:
                return {...state, deletingError: null, deleting: true};
            case DELETE_TEAM_SUCCEEDED: {
                let teams = [...(state.teams || [])];
                const team = payload.team;
                const index = teams.findIndex(it => it._id === team._id);
                if (index !== -1) {
                    teams.splice(index, 1);
                }
                return {...state, teams: teams, deleting: false};
            }
            case DELETE_TEAM_FAILED:
                return {...state, deletingError: payload.error, deleting: false};
            default:
                return state;
        }
    };

export const TeamContext = React.createContext<TeamsState>(initialState);

interface TeamProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const TeamProvider: React.FC<TeamProviderProps> = ({children}) => {
        const myLocation = useMyLocation();
        const {latitude: lat, longitude: lng} = myLocation.position?.coords || {}

        const {token} = useContext(AuthContext);
        const [state, dispatch] = useReducer(reducer, initialState);
        const {teams, fetching, fetchingError, saving, savingError, deleting, deletingError} = state;

        const [networkStatus, setNetworkStatus] = useState<boolean>(false);
        Network.getStatus().then(status => setNetworkStatus(status.connected));
        const [savedOffline, setSavedOffline] = useState<boolean>(false);
        const [deletedOffline, setDeletedOffline] = useState<boolean>(false);
        useEffect(networkEffect, [token, setNetworkStatus]);

        useEffect(getTeamsEffect, [token]);
        useEffect(wsEffect, [token]);
        const saveTeam = useCallback<SaveTeamFn>(saveTeamCallback, [token]);
        const removeTeam = useCallback<DeleteTeamFn>(deleteTeamCallback, [token]);

        const value = {
            teams,
            fetching,
            fetchingError,
            saving,
            savingError,
            saveTeam: saveTeam,
            deleting,
            deletingError,
            deleteTeam: removeTeam
        };
        log('returns');
        return (
            <TeamContext.Provider value={value}>
                {children}
            </TeamContext.Provider>
        );

        async function deleteTeamCallback(team: TeamProps) {
            try {
                if (navigator.onLine) {
                    log('deleteTeam started');
                    dispatch({type: DELETE_TEAM_STARTED});
                    const deletedTeam = await deleteTeam(token, team);
                    log('deleteTeam succeeded');
                    dispatch({type: DELETE_TEAM_SUCCEEDED, payload: {team: deletedTeam}});
                } else {
                    alert("DELETED OFFLINE");
                    log('deleteTeam failed');
                    team._id = (team._id === undefined) ? ('_' + Math.random().toString(36).substr(2, 9)) : team._id;
                    await Storage.remove({key: team._id});
                    dispatch({type: DELETE_TEAM_SUCCEEDED, payload: {team: team}});
                    setDeletedOffline(true);
                }
            } catch (error) {
                log('deleteTeam failed');
                dispatch({type: DELETE_TEAM_FAILED, payload: {error}});
            }
        }

        function networkEffect() {
            console.log("network effect");
            log('network effect');
            let canceled = false;
            Network.addListener('networkStatusChange', async (status) => {
                if (canceled)
                    return;
                const connected = status.connected;
                if (connected) {
                    alert('SYNC data');
                    log('sync data');
                    await syncData(token);
                }
                setNetworkStatus(status.connected);
            });
            return () => {
                canceled = true;
            }
        }

        function getTeamsEffect() {
            let cancelled = false;
            fetchTeams().then(r => log(r));
            return () => {
                cancelled = true;
            }

            async function fetchTeams() {
                if (!token?.trim()) {
                    return;
                }
                if (!navigator?.onLine) {
                    alert("FETCHING ELEMENTS OFFLINE!");
                    let storageKeys = Storage.keys();
                    const teams = await storageKeys.then(async function (storageKeys) {
                        const saved = []
                        for (let i = 0; i < storageKeys.keys.length; i++) {
                            if (storageKeys.keys[i] !== 'token') {
                                const team = await Storage.get({key: storageKeys.keys[i]});
                                if (team.value != null)
                                    var parsedTeam = JSON.parse(team.value);
                                saved.push(parsedTeam);
                            }
                        }
                        return saved;
                    });
                    dispatch({type: FETCH_TEAMS_SUCCEEDED, payload: {teams: teams}});
                } else {
                    try {
                        log('fetchTeams started');
                        dispatch({type: FETCH_TEAMS_STARTED});

                        const teams = await getTeams(token);
                        log('fetchTeams succeeded');
                        if (!cancelled) {
                            dispatch({type: FETCH_TEAMS_SUCCEEDED, payload: {teams: teams}});
                        }
                    } catch (error) {
                        let storageKeys = Storage.keys();
                        const teams = await storageKeys.then(async function (storageKeys) {
                            const saved = []
                            for (let i = 0; i < storageKeys.keys.length; i++) {
                                if (storageKeys.keys[i] !== 'token') {
                                    const team = await Storage.get({key: storageKeys.keys[i]});
                                    if (team.value != null)
                                        var parsedTeam = JSON.parse(team.value);
                                    saved.push(parsedTeam);
                                }
                            }
                            return saved;
                        });
                        dispatch({type: FETCH_TEAMS_SUCCEEDED, payload: {teams: teams}});
                    }
                }
            }
        }

        async function saveTeamCallback(team: TeamProps) {
            try {
                if (navigator.onLine) {
                    log('saveTeam started');
                    dispatch({type: SAVE_TEAM_STARTED});
                    const savedTeam = await (team._id ? updateTeam(token, team) : createTeam(token, team));
                    log('saveTeam succeeded');
                    dispatch({type: SAVE_TEAM_SUCCEEDED, payload: {team: savedTeam}});
                } else {
                    alert("SAVED OFFLINE");
                    log('saveTeam failed');
                    team._id = (team._id === undefined) ? ('_' + Math.random().toString(36).substr(2, 9)) : team._id;
                    await Storage.set({
                        key: team._id!,
                        value: JSON.stringify({
                            _id: team._id,
                            name: team.name,
                            location: team.location,
                            isLeader: team.isLeader,
                            numberOfMatches: team.numberOfMatches
                        })
                    });
                    dispatch({type: SAVE_TEAM_SUCCEEDED, payload: {team: team}});
                    setSavedOffline(true);
                }
            } catch (error) {
                log('saveTeam failed');
                await Storage.set({
                    key: String(team._id),
                    value: JSON.stringify(team)
                })
                dispatch({type: SAVE_TEAM_SUCCEEDED, payload: {team: team}});
            }

        }

        function wsEffect() {
            let canceled = false;
            log('wsEffect - connecting');
            let closeWebSocket: () => void;
            if (token?.trim()) {
                closeWebSocket = newWebSocket(token, message => {
                    if (canceled) {
                        return;
                    }
                    const {type, payload: team} = message;
                    log(`ws message, team ${type}`);
                    if (type === 'created' || type === 'updated') {
                        dispatch({type: SAVE_TEAM_SUCCEEDED, payload: {team: team}});
                    }
                    if (type === 'deleted') {
                        dispatch({type: DELETE_TEAM_SUCCEEDED, payload: {team: team}});
                    }
                });
            }
            return () => {
                log('wsEffect - disconnecting');
                canceled = true;
                closeWebSocket?.();
            }
        }
    }
;
