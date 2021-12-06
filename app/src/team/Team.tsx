import React, {useState} from 'react';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonImg,
    IonLabel
} from '@ionic/react';
import {TeamProps} from './TeamProps';
import {closeCircle, shieldCheckmarkOutline} from "ionicons/icons";
import DefaultPhoto from "../assets/img/defaultPhoto.png";
interface TeamPropsExt extends TeamProps {
    onEdit: (_id?: string) => void;
}
/*
  name: string;
  location: string;
  isLeader: boolean;
  numberOfMatches: number;
 */

const Team: React.FC<TeamPropsExt> = ({_id, name, location, isLeader, numberOfMatches, onEdit}) => {

  return (
        <IonCard onClick={() => onEdit(_id)}>
            <IonCardHeader>
                <IonCardTitle>{name}</IonCardTitle>
                <IonCardSubtitle>Games Played: {numberOfMatches}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
                <IonLabel>Location: {location}</IonLabel>
                <br/>
                <IonLabel>Leader of the group: {isLeader ? (<IonIcon icon={shieldCheckmarkOutline}/>) :
                    (<IonIcon icon={closeCircle}/>)} </IonLabel>
            </IonCardContent>
          <img id="image" src={DefaultPhoto} width="400" height="400"/>
        </IonCard>
    );
};

export default Team;

