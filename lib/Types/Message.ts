import { MessageRoom } from './Room';
import { House } from './House';
import { User } from '../Collections/User';
import { Room } from '../Collections/Room';

export interface APIMessage {
  id: string;
  content: string;
  timestamp: Date;
  room_id: string;
  house_id: string;
  author_id: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  room: Room;
  house: House;
  author: User;
  edit?: (content: string) => void;
}
