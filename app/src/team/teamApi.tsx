import axios from 'axios';
import {authConfig, baseUrl, getLogger, withLogs} from '../core';
import {TeamProps} from './TeamProps';
import {Storage} from '@capacitor/core';

const teamUrl = `http://${baseUrl}/api/team`;

export const getTeams: (token: string) => Promise<TeamProps[]> = token => {
    try {
        const result = axios.get(`${teamUrl}`, authConfig(token));
        result.then(async result => {
            // @ts-ignore
            for (const each of result.data) {
                await Storage.set({
                    key: each._id!,
                    value: JSON.stringify({
                        _id: each._id,
                        name: each.name,
                        location: each.location,
                        isLeader: each.isLeader,
                        numberOfMatches: each.numberOfMatches,
                        lat: each.lat,
                        lng: each.lng
                    })
                })
            }
        }).catch(error => {
            if (error.response) {
                console.log('client received an error response (5xx, 4xx)');
            } else if (error.request) {
                console.log('client never received a response, or request never left');
            } else {
                console.log('anything else');
            }
        });
        return withLogs(result, 'getTeams');
    } catch (error) {
        throw error;
    }
}

export const createTeam: (token: string, team: TeamProps) => Promise<TeamProps[]> = (token, team) => {
    const result = axios.post(`${teamUrl}`, team, authConfig(token));
    result.then(async result => {
        const item: any = result.data;
        await Storage.set({
            key: item._id!,
            value: JSON.stringify({
                _id: item._id,
                name: item.name,
                location: item.location,
                isLeader: item.isLeader,
                numberOfMatches: item.numberOfMatches,
                lat: item.lat,
                lng: item.lng
            })
        })
    }).catch(err => {
        if (err.response) {
            console.log('client received an error response (5xx, 4xx)');
        } else if (err.request) {
            alert('client never received a response, or request never left');
        } else {
            console.log('anything else');
        }
    });
    return withLogs(result, 'createTeam');
}

export const updateTeam: (token: string, team: TeamProps) => Promise<TeamProps[]> = (token, team) => {
    const result = axios.put(`${team}/${team._id}`, team, authConfig(token));
    result.then(async result => {
        const item: any = result.data;
        await Storage.set({
            key: item._id!,
            value: JSON.stringify({
                _id: item._id,
                name: item.name,
                location: item.location,
                isLeader: item.isLeader,
                numberOfMatches: item.numberOfMatches
            })
        }).catch(err => {
            if (err.response) {
                alert('client received an error response (5xx, 4xx)');
            } else if (err.request) {
                alert('client never received a response, or request never left');
            } else {
                alert('anything else');
            }
        })
    });
    return withLogs(result, 'updateTeam');
}

export const deleteTeam: (token: string, team: TeamProps) => Promise<TeamProps[]> = (token, team) => {
    const result = axios.delete(`${teamUrl}/${team._id}`, authConfig(token));
    result.then(async result => {
        const item: any = result.data;
        await Storage.remove({key: item._id!})
            .catch(err => {
                if (err.response) {
                    alert('client received an error response (5xx, 4xx)');
                } else if (err.request) {
                    alert('client never received a response, or request never left');
                } else {
                    alert('anything else');
                }
            })
    });
    return withLogs(result, 'deleteTeam');
}

const equals = (team1: any, team2: any) => {
    return team1.name === team2.name && team1.location === team2.location && team1.isLeader === team2.isLeader && team1.numberOfMatches === team2.numberOfMatches;
}

// @ts-ignore
export const syncData: (token: string) => Promise<TeamProps[]> = async token => {
    try {
        const {keys} = await Storage.keys();
        const result = axios.get(`${teamUrl}`, authConfig(token));
        result.then(async result => {
            for (const key of keys) {
                if (key !== 'token') {
                    // @ts-ignore
                    const teamOnServer = result.data.find((each: { _id: string; }) => each._id === key);
                    const teamLocal = await Storage.get({key: key});

                    if (teamOnServer !== undefined && !equals(teamOnServer, JSON.parse(teamLocal.value!))) { //update
                        axios.put(`${teamUrl}/${key}`, JSON.parse(teamLocal.value!), authConfig(token));
                    } else if (teamOnServer === undefined) { //create
                        axios.post(`${teamUrl}`, JSON.parse(teamLocal.value!), authConfig(token));
                    } // nothing changed
                }
            }
            for (const team of result.data) {
                const localTeam = keys.find((id => id === team._id));
                if (localTeam === undefined) {
                    axios.delete(`${teamUrl}/${team._id}`, authConfig(token));
                }
            }
        }).catch(err => {
            if (err.response) {
                console.log('client received an error response (5xx, 4xx)');
            } else if (err.request) {
                console.log('client never received a response, or request never left');
            } else {
                console.log('anything else');
            }
        })
        return withLogs(result, 'syncItems');
    } catch (error) {
        throw error;
    }
}

interface MessageData {
    type: string;
    payload: {
        team: TeamProps;
    };
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({type: 'authorization', payload: {token}}));
    };
    ws.onclose = function (event) {
        console.log(event);
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}