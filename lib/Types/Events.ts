import { HouseCollection } from "../Collections/House";
import { RoomCollection } from "../Collections/Room";
import { UserCollection } from "../Collections/User";
import { MemberCollection } from "../Collections/Member";
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
  house_join: [HouseCollection];
  HOUSE_JOIN: [HouseCollection];
  house_member_join: [MemberCollection];
  HOUSE_MEMBER_JOIN: [MemberCollection];
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
  room: RoomCollection;
  content: string;
  timestamp: Date;
  house: HouseCollection;
  author: UserCollection;
  member?: MemberCollection;
}
