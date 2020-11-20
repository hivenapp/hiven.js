import { Room } from '../Collections/Room';
import { APIMember, Member } from './Member';

export interface House {
  banner?: string;
  icon?: string;
  id: string;
  members: Member[];
  name: string;
  owner_id: string;
  rooms: Room;
  synced: boolean;
  unavailable?: boolean;
}

export interface APIHouse {
  banner?: string;
  icon?: string;
  id: string;
  members: APIMember[];
  name: string;
  rooms: Room;
  house_id: string;
  owner_id: string;
  synced: boolean;
  unavailable?: boolean;
}
