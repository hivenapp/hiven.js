import { RoomCollection } from '../Collections/Room';
import { APIMember, Member } from './Member';

export interface House {
  banner?: string;
  icon?: string;
  id: string;
  members: Member[];
  name: string;
  owner_id: string;
  rooms: RoomCollection;
  synced: boolean;
  unavailable?: boolean;
}

export interface APIHouse {
  banner?: string;
  icon?: string;
  id: string;
  members: APIMember[];
  name: string;
  rooms: RoomCollection;
  house_id: string;
  owner_id: string;
  synced: boolean;
  unavailable?: boolean;
}
