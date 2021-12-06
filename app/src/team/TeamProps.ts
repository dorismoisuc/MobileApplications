export interface TeamProps {
  _id?: string;
  name: string;
  location: string;
  isLeader: boolean;
  numberOfMatches: number;
  lat?: number;
  lng?: number;
}
