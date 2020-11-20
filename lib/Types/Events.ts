import { House } from "../Collections/House";
import { Room } from "../Collections/Room";
import { User } from "../Collections/User";
import { Member } from "../Collections/Member";
import { APIBaseRoom, BaseRoom } from "./Room";

// `any` isnt a strict type I know but its more user friendly than casting `unknown` to a payload type they dont know
export interface ClientEvents {
  RAW: [RawEventBody];
  init: [any];
  room_create: [BaseRoom];
  ROOM_CREATE: [APIBaseRoom];
  room_update: [APIBaseRoom];
  ROOM_UPDATE: [APIBaseRoom];
  room_delete: [APIBaseRoom];
  ROOM_DELETE: [APIBaseRoom];
  message: [HouseMessage];
  MESSAGE_CREATE: [HouseMessage];
  message_update: [any];
  MESSAGE_UPDATE: [any];
  message_delete: [any];
  MESSAGE_DELETE: [any];
  typing_start: [any];
  TYPING_START: [any];
  house_join: [House];
  HOUSE_JOIN: [House];
  house_member_join: [Member];
  HOUSE_MEMBER_JOIN: [Member];
  house_member_leave: [any];
  HOUSE_MEMBER_LEAVE: [any];
  call_create: [any];
  CALL_CREATE: [any];
}

export interface RawEventBody {
  event: string;
  data: any;
}

export interface HouseMessage {
  id: string;
  room: Room;
  content: string;
  timestamp: Date;
  house: House;
  author: User;
  member?: Member;
}
