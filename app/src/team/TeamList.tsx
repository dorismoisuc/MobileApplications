import React, {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    createAnimation,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonInput,
    IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonRow,
    IonSearchbar,
    IonTitle,
    IonToast,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {TeamContext} from './TeamProvider';
import Team from "./Team";
import {TeamProps} from "./TeamProps";
import {useNetwork} from "../hooks/useNetwork";
import {LogoutButton} from "../animation/LogoutButton";
import {Network} from "@capacitor/core";

const log = getLogger('TeamList');

const offset = 3;

const TeamList: React.FC<RouteComponentProps> = ({history}) => {
        const {teams, fetching, fetchingError} = useContext(TeamContext);
        const {savedOffline, setSavedOffline} = useContext(TeamContext);

        const [networkStatus, setNetworkStatus] = useState<boolean>(true);
        Network.getStatus().then(status => setNetworkStatus(status.connected));
        Network.addListener('networkStatusChange', (status) => {
            setNetworkStatus(status.connected);
          })

        const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
        const [visibleTeams, setVisibleTeams] = useState<TeamProps[] | undefined>([]);
        const [elementsPerPage, setElementsPerPage] = useState(0);
        const [filter, setFilter] = useState<string | undefined>(undefined);
        const [search, setSearch] = useState<string>("");

        useEffect(() => {
            if (teams?.length && teams?.length > 0) {
                setElementsPerPage(offset);
                fetchData();
                log(teams);
            }
        }, [teams]);

        useEffect(() => {
            if (teams && filter) {
                if (filter === "0") {
                    setVisibleTeams(teams);
                } else {
                    setVisibleTeams(teams.filter(each => each.numberOfMatches <= parseInt(filter)));
                }
            }
        }, [filter]);

        useEffect(() => {
            if (search === "") {
                setVisibleTeams(teams);
            }
            if (teams && search !== "") {
                setVisibleTeams(teams.filter(each => each.location.toLocaleLowerCase().includes(search.toLocaleLowerCase())));
            }
        }, [search]);

        function fetchData() {
            setVisibleTeams(teams?.slice(0, elementsPerPage + offset));
            setElementsPerPage(elementsPerPage + offset);
            if (teams && elementsPerPage > teams?.length) {
                setVisibleTeams(teams);
                setDisableInfiniteScroll(true);
                setElementsPerPage(teams.length);
            } else {
                setDisableInfiniteScroll(false);
            }
        }

        async function searchNext($event: CustomEvent<void>) {
            //TODO: set timeout to observe fetchData behaviour
            await new Promise(resolve => setTimeout(resolve, 1000));
            fetchData();
            log("pagination");
            ($event.target as HTMLIonInfiniteScrollElement).complete();
        }

        function startAnimation() {
            if (animation) {
                animation.play();
            }
        }

        function getAnimation() {
            const addButton = document.querySelector('.addButton');
            if (addButton) {
                const animation = createAnimation()
                    .addElement(addButton)
                    .duration(1000)
                    .direction('alternate')
                    .iterations(Infinity)
                    .keyframes([
                        {offset: 0, transform: 'scale(3)', opacity: '1'},
                        {
                            offset: 1, transform: 'scale(1.5)', opacity: '0.5'
                        }
                    ]);
                return animation
            }
            return undefined;
        }

        let animation = getAnimation();

        function stopAnimation() {
            if (animation) {
                animation.stop();
            }
        }

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonGrid>
                            <IonRow>
                                <IonTitle>
                                    <IonLabel
                                        color={networkStatus ? "success" : "danger"}>{networkStatus ? "Volleyball Teams - Online" : "Volleyball Teams - Offline"}</IonLabel>
                                </IonTitle>
                                <LogoutButton/>
                            </IonRow>
                            <IonRow>
                                <IonSearchbar style={{width: '70%'}} placeholder="Search by location" value={search}
                                              debounce={200} onIonChange={(e) => {
                                    setSearch(e.detail.value!);
                                }}/>
                                <IonInput style={{width: '20%'}} type="number" value={filter} placeholder="Filter by games played"
                                          onIonChange={(e) => setFilter(e.detail.value ? e.detail.value : undefined)}/>
                            </IonRow>
                        </IonGrid>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonLoading isOpen={fetching} message="Fetching teams"/>
                    {visibleTeams && (
                        <IonList>
                            {Array.from(visibleTeams)
                                .filter(each => {
                                    if (filter !== undefined && filter !== "0")
                                        return each.numberOfMatches <= parseInt(filter) && each._id != undefined;
                                    return each._id != undefined;
                                })
                                .map(({_id, name, location, isLeader, numberOfMatches}) =>
                                    <Team key={_id} _id={_id} name={name} location={location} isLeader={isLeader}
                                          numberOfMatches={numberOfMatches}
                                          onEdit={id => history.push(`/team/${id}`)}/>)}
                        </IonList>
                    )}
                    <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                                       onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                        <IonInfiniteScrollContent loadingText="Loading...">
                        </IonInfiniteScrollContent>
                    </IonInfiniteScroll>

                    {fetchingError && (
                        <div>{fetchingError.message || 'Failed to fetch teams'}</div>
                    )}
                    <IonFab vertical="bottom" horizontal="end" slot="fixed">
                        <IonFabButton className={'addButton'} onClick={() => history.push('/team')}
                                      onMouseEnter={() => startAnimation()}
                                      onMouseLeave={() => stopAnimation()}>
                            <IonIcon icon={add}/>
                        </IonFabButton>
                    </IonFab>
                    <IonToast
                        isOpen={!!savedOffline}
                        message="Your changes will be visible on server when you get back online!"
                        duration={5000}/>
                </IonContent>
            </IonPage>
        );
    }
;

export default TeamList;
