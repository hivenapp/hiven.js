// Modules
import { EventEmitter } from "events";
import Websocket from "./Websocket";
import Rest from "./Rest/index";

// Collections
import HouseStore from "./Collections/House";
import MessageStore from "./Collections/Message";
import MemberStore from "./Collections/Member";
import RoomStore from "./Collections/Room";
import UserStore from "./Collections/User";

// Types
import Collection from "./Types/Collection";
import ClientUser from "./Types/ClientUser";
import House from "./Types/House";
import Member from "./Types/Member";
import Message from "./Types/Message";
import MessageRoom from "./Types/MessageRoom";

export declare let rest: Rest;
export declare let client: Client;

export default class Client extends EventEmitter {
  
  private ws: Websocket;
  private rest: Rest;
  public users: Collection;
  public rooms: Collection;
  public houses: Collection;
  public members: Collection;
  public messages: Collection;

  private user: ClientUser;
  private options: any;
  private token: string;

  constructor(options = { clientType: "bot" }) {
    // Call parent class constructor
    super();

    this.options = options;

    // Websocket
    this.ws = new Websocket();

    // Rest

    this.rest = new Rest(this);
    rest = this.rest;
    client = this;

    this.users = new UserStore(this);
    this.rooms = new RoomStore(this);
    this.houses = new HouseStore(this);
    this.members = new MemberStore(this);
    this.messages = new MessageStore(this);
  }

  async connect(token: string) {
    // Set the token in the instance
    if (this.options.clientType === "bot") this.token = `Bot ${token}`;
    else this.token = token;

    this.rest.init(this);

    // Connect to the socket
    await this.ws.init();

    // Auth with the socket
    await this.ws.sendOp(2, { token: token });

    this.ws.on("data", (body) => {
      const { e, d } = body;
      // Emits every event to RAW
      let raw = {
        event: e,
        description: d,
      };
      this.emit("RAW", raw);

      // Detect if it'sthe init event to set the user in the instance
      switch (e) {
        case "INIT_STATE":
          this.user = d.user;
          this.users.set(d.user.id, d.user);
          d.private_rooms.forEach(room => {
            this.rooms.collect(room.id, room)
         })
          this.emit("ready");
          break;
        case "ROOM_CREATE":
          // New room created, add it to our cache
          /* eslint-disable-next-line no-case-declarations */
          let createRoomHouse: House = this.houses.get<House>(d.house_id);

          /* eslint-disable-next-line no-case-declarations */
          let room: MessageRoom = d;

          createRoomHouse.rooms = [...createRoomHouse.rooms, room];

          this.rooms.collect(room.id, room);
          this.houses.collect(createRoomHouse.id, createRoomHouse);
          break;
        case "ROOM_UPDATE":
          // Room has been edited

          this.emit(e, d);
          break;
        case "ROOM_DELETE":
          // Room deleted, remove it from our cache
          /* eslint-disable-next-line no-case-declarations */
          let rooms: MessageRoom[] = this.houses // Message Room for now
            .get<House>(d.house_id)
            .rooms.filter((r) => r.id !== d.id);

          this.houses.get<House>(d.house_id).rooms = rooms;
          this.rooms.delete(d.id);

          this.emit(e, d);
          break;
        case "MESSAGE_CREATE":
          /* eslint-disable-next-line no-case-declarations */
          let message: Message = {
            id: d.id,
            content: d.content,
            timestamp: new Date(d.timestamp),
            room: this.rooms.get(d.room_id),
            house: this.houses.get<House>(d.house_id),
            author: this.users.get(d.author_id),
          };

          this.messages.collect(d.id, message);
          return this.emit(e, message);
        case "MESSAGE_UPDATE":
          // Room has been edited

          this.emit(e, d);
          break;
        case "MESSAGE_DELETE":
          this.messages.delete(d.id);
          this.emit(e, d);
          break;
        case "TYPING_START":
          this.emit(e, d);
          break;
        case "HOUSE_JOIN":
          // Define house object
          /* eslint-disable-next-line no-case-declarations */
          let joinHouse = d;
          let finalRooms = [];

          // Handle caching rooms
          d.rooms.forEach(async (room) => {
            // Message room for now
            let house = this.houses.get(room.house_id);

            let finalRoom: MessageRoom = {
              id: room.id,
              name: room.name,
              house_id: room.house_id,
              position: room.position,
              type: room.type,
              description: room.description,
              permission_overwrites: room.permission_overwrites,
              recipients: room.recipients,
              typing: room.typing,
              last_message_id: room.last_message_id,
              emoji: room.emoji,
            };
            finalRooms.push(finalRoom);
            this.rooms.collect(room.id, finalRoom);
          });

          // Handle caching members and users
          /* eslint-disable-next-line no-case-declarations */
          const members: any[] = [];
          d.members.forEach(async (member: Member) => {
            members.push(member);
            this.users.set(member.id, member.user);
          });
          joinHouse.members = members;

          /* eslint-disable-next-line no-case-declarations */
          let newHouse: House = {
            id: joinHouse.id,
            name: joinHouse.name,
            owner_id: joinHouse.owner_id,
            icon: joinHouse.icon,
            members: joinHouse.members,
            rooms: joinHouse.rooms,
            banner: joinHouse.banner,
            synced: joinHouse.synced
          };

          // Cache houses
          this.houses.collect(joinHouse.id, newHouse);

          // Final rooms
          /* eslint-disable-next-line no-case-declarations */
          // Cahce houses
          delete newHouse.rooms;
          newHouse.rooms = finalRooms;

          this.houses.collect(newHouse.id, newHouse);
          break;
        case "HOUSE_MEMBER_JOIN":
          /* eslint-disable-next-line no-case-declarations */
          let houseJoin: House = this.houses.get<House>(d.house_id);

          /* eslint-disable-next-line no-case-declarations */
          let member: Member = d;

          houseJoin.members.push(member);

          this.houses.collect(houseJoin.id, houseJoin);
          this.users.set(d.user_id, d.user);

          member.house_id = houseJoin.id;

          return this.emit(e, member);
        case "HOUSE_MEMBER_LEAVE":
          /* eslint-disable-next-line no-case-declarations */
          let houseLeave: House = this.houses.get<House>(d.house_id);

          /* eslint-disable-next-line no-case-declarations */
          const memberToRemove = houseLeave.members.findIndex(
            (member) => member.id == d.id
          );

          /* eslint-disable-next-line no-case-declarations */
          let memberLeave = houseLeave.members[memberToRemove];

          if (memberToRemove) houseLeave.members.slice(memberToRemove, 1);

          this.houses.collect(houseLeave.id, houseLeave);

          memberLeave.house_id = houseLeave.id;

          return this.emit(e, memberLeave);
        default:
          break;
      }

      if (body && d) this.emit(e, d);
    });

    return true;
  }

  async destroy() {
    this.ws.destroy();
  }
}
