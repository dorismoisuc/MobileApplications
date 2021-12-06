import React, {useContext, useEffect, useState} from 'react';
import {
    IonActionSheet,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonImg,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {getLogger} from '../core';
import {TeamContext} from './TeamProvider';
import {RouteComponentProps} from 'react-router';
import {TeamProps} from './TeamProps';
import {camera, close, remove, trash} from "ionicons/icons";
import {Photo, usePhotoGallery} from "../hooks/usePhotoGallery";
import {useMyLocation} from "../hooks/useMyLocation";
import {MyMap} from "../components/MyMap";

const log = getLogger('TeamEdit');

interface TeamEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const TeamEdit: React.FC<TeamEditProps> = ({history, match}) => {
    const {teams, saving, savingError, saveTeam, deleteTeam} = useContext(TeamContext);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [isLeader, setIsLeader] = useState(false);
    const [numberOfMatches, setNumberOfMatches] = useState(0);
    const initialTeam = teams?.find(it => it._id === match.params.id);
    const [team, setTeam] = useState<TeamProps>(initialTeam!);
    const {photos, takePhoto, deletePhoto} = usePhotoGallery(team?._id);
    const [photoToDelete, setPhotoToDelete] = useState<Photo>();
    const myLocation = useMyLocation();
    const [lat, setLat] = useState(myLocation.position?.coords.latitude);
    const [lng, setLng] = useState(myLocation.position?.coords.longitude);

    useEffect(() => {
        log('useEffect');
        if (team) {
            setName(team.name);
            setLocation(team.location);
            setIsLeader(team.isLeader);
            setNumberOfMatches(team.numberOfMatches);
            setLat(team.lat);
            setLng(team.lng);
        }
    }, [match.params.id, teams]);
    const handleSave = () => {
        const editedTeam = team ? {...team, name, location, isLeader, numberOfMatches, lat, lng} : {
            name: name,
            location: location,
            isLeader: isLeader,
            numberOfMatches: numberOfMatches,
            lat: lat,
            lng: lng
        };
        saveTeam && saveTeam(editedTeam).then(() => history.goBack());
    };
    log('render');

    let handleDelete = () => {
        const deletedTeam = team ? {...team, name, location, isLeader, numberOfMatches, lat, lng} : {
            name: name,
            location: location,
            isLeader: isLeader,
            numberOfMatches: numberOfMatches,
            lat: lat,
            lng: lng
        };
        deleteTeam && deleteTeam(deletedTeam).then(() => history.goBack());
    };

    let DeleteButton = team ? (<IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleDelete}>
            <IonIcon icon={remove}/>
        </IonFabButton>
    </IonFab>) : null

    let pageTitle = team ? (<IonTitle>Edit</IonTitle>) : (<IonTitle>Add</IonTitle>)

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    {pageTitle}
                    <IonButtons slot={"start"}>
                        <IonBackButton defaultHref="/teams"/>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    <IonItem>
                        <IonLabel>Name: </IonLabel>
                        <IonInput placeholder={"enter name"} value={name}
                                  onIonChange={e => setName(e.detail.value || '')}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Location: </IonLabel>
                        <IonInput value={location} onIonChange={e => setLocation(e.detail.value || '')}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Leadership: </IonLabel>
                        <IonCheckbox checked={isLeader} onIonChange={e => setIsLeader(e.detail.checked)}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Games Played: </IonLabel>
                        <IonInput type={"number"} value={numberOfMatches}
                                  onIonChange={e => setNumberOfMatches(Number(e.detail.value) || 0)}/>
                    </IonItem>
                </IonList>
                <IonGrid>
                    <IonRow>
                        {photos.map((photo, index) => (
                            <IonCol size="6" key={index}>
                                <IonImg onClick={() => setPhotoToDelete(photo)} src={photo.webviewPath}/>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save team'}</div>
                )}
                {
                    <MyMap
                        lat={lat}
                        lng={lng}
                        onMapClick={(e: any) => {
                            setLat(e.latLng.lat());
                            setLng(e.latLng.lng());
                        }}
                        onMarkerClick={log('onMarker')}
                    />}
                {DeleteButton}
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={() => takePhoto()}>
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>
                <IonActionSheet
                    isOpen={!!photoToDelete}
                    buttons={[{
                        text: 'Delete',
                        role: 'destructive',
                        icon: trash,
                        handler: () => {
                            if (photoToDelete) {
                                deletePhoto(photoToDelete);
                                setPhotoToDelete(undefined);
                            }
                        }
                    }, {
                        text: 'Cancel',
                        icon: close,
                        role: 'cancel'
                    }]}
                    onDidDismiss={() => setPhotoToDelete(undefined)}
                />
            </IonContent>
        </IonPage>
    );
};

export default TeamEdit;
