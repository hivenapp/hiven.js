// Modules
import { EventEmitter } from 'events';
import { WS } from './Websocket';
import Rest from './Rest/index';

// Collections
import { House as HouseStore } from './Collections/House';
import { Message as MessageStore } from './Collections/Message';
import { Member as MemberStore } from './Collections/Member';
import { Room as RoomStore } from './Collections/Room';
import { User as UserStore, User } from './Collections/User';

// Types
import { ClientUser } from './Types/ClientUser';
import { House } from './Collections/House';
import { Member } from './Collections/Member';
import { Message } from './Collections/Message';
import { Room } from './Collections/Room';
import { MessageRoom, APIBaseRoom, BaseRoom } from './Types/Room';
import { APIMember } from 'Types/Member';

export declare let rest: Rest;
export declare let client: Client;

interface ClientOptions {
  type: string;
}

export class Client extends EventEmitter {
  private ws: WS;
  private rest: Rest;
  public users: User;
  public rooms: Room;
  public houses: House;
  public members: Member;
  public messages: Message;

  public options: any;
  public user: ClientUser | undefined;
  public token: string | undefined;

  constructor(options: ClientOptions = { type: 'bot' }) {
    // Call parent class constructor
    super();

    this.options = options;

    // WS
    this.ws = new WS();

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

  async Connect(token: string) {
    // Set the token in the instance
    if (this.options.type === 'bot') this.token = `Bot ${token}`;
    else this.token = token;
    console.log(token, this.options.type, this.token);

    this.rest.init(this);

    // Connect to the socket
    await this.ws.init();

    // Auth with the socket
    await this.ws.sendOp(2, { token: token });

    this.ws.on('data', (body) => {
      const { e, d } = body;
      // Emits every event to RAW
      let raw = {
        event: e,
        description: d
      };
      this.emit('RAW', raw);

      // Detect if it's the init event to set the user in the instance
      switch (e) {
        case 'INIT_STATE': {
          this.user = d.user;
          this.users.Set(d.user.id, d.user);
          d.private_rooms.forEach((room: APIBaseRoom) => {
            this.rooms.Collect(room.id, {
              id: room.id,
              name: room.name,
              house: room.house_id
            });
          });

          this.emit('ready', d);
          return this.emit(e, d);
        }
        case 'ROOM_CREATE': {
          let createRoomHouse: House = this.houses.Resolve<House>(d.house_id);

          createRoomHouse.rooms?.Collect(d.id, {
            id: d.id,
            name: d.name,
            house: createRoomHouse
          });

          this.rooms.Collect(d.id, {
            id: d.id,
            name: d.name,
            house: createRoomHouse
          });

          this.houses.Collect(createRoomHouse?.id || '', createRoomHouse);
          this.emit('room_create', d);
          return this.emit(e, d);
        }
        case 'ROOM_UPDATE': {
          this.emit('room_update', d);
          return this.emit(e, d);
        }
        case 'ROOM_DELETE': {
          let rooms: Room | undefined = this.houses.Get<House>(d.house_id).rooms?.Get<Room>(d.id);

          this.houses.Get<House>(d.house_id).rooms = rooms;
          this.rooms.delete(d.id);

          this.emit('room_delete', d);
          return this.emit(e, d);
        }
        case 'MESSAGE_CREATE': {
          let house = this.houses.Resolve<HouseStore>(d.house_id);

          const collect_message = this.messages.Collect(d.id, {
            id: d.id,
            content: d.content,
            timestamp: new Date(d.timestamp),
            room: this.rooms.Resolve<Room>(d.room_id),
            house: this.houses.Resolve<House>(d.house_id),
            author: this.users.Resolve<User>(d.author_id),
            member: house?.members?.Resolve<Member>(d.author_id)
          });

          this.emit('message', collect_message);
          return this.emit(e, collect_message);
        }
        case 'MESSAGE_UPDATE': {
          this.emit('message_update', d);
          return this.emit(e, d);
        }
        case 'MESSAGE_DELETE': {
          this.messages.Delete(d.id);
          this.emit('message_delete', d);
          return this.emit(e, d);
        }
        case 'TYPING_START': {
          this.emit('typing_start', d);
          return this.emit(e, d);
        }
        case 'HOUSE_JOIN': {
          let joinHouse = d;
          let house = this.houses.Resolve<HouseStore>(joinHouse.id);
          if (!house)
            house = this.houses.Collect<House>(joinHouse.id, {
              id: joinHouse.id,
              name: joinHouse.name,
              members: new MemberStore(client),
              rooms: new RoomStore(client)
            });

          d.rooms.forEach(async (room: APIBaseRoom) => {
            let finalRoom: BaseRoom = {
              id: room.id,
              name: room.name,
              house,
              position: room.position,
              type: room.type,
              description: room.description,
              permission_overwrites: room.permission_overwrites,
              recipients: room.recipients,
              typing: room.typing,
              last_message_id: room.last_message_id,
              emoji: room.emoji
            };
            this.rooms.Collect(room.id, finalRoom);
            house.rooms?.Collect(room.id, finalRoom);
          });

          d.members.forEach(async (member: APIMember) => {
            house.members?.Collect(member.id, {
              id: member.id,
              roles: member.roles,
              last_message_id: member.last_message_id,
              house,
              user: this.users.Resolve(member.id)
            });
            this.users.Collect(member.id, member.user);
            this.members.Collect(member.id, member.user);
          });

          // Cache houses
          this.houses.Collect(house.id || '', {
            id: house.id,
            name: house.name,
            owner: this.users.Resolve(house.owner_id || ''),
            icon: house.icon,
            members: house.members,
            rooms: house.rooms,
            banner: house.banner,
            synced: house.synced
          });

          this.emit('house_join', house);
          return this.emit(e, house);
        }
        case 'HOUSE_MEMBER_JOIN': {
          let houseJoin: House = this.houses.Get<House>(d.house_id);
          let member: Member = d;

          houseJoin.members?.Collect(member.id, {
            id: member.id,
            house: houseJoin
          });

          this.houses.Collect(houseJoin.id || '', houseJoin);
          this.users.Set(d.user_id, d.user);

          this.emit('house_member_join', d);
          return this.emit(e, member);
        }
        case 'HOUSE_MEMBER_LEAVE': {
          // Soon
          this.emit('house_member_leave', d);
          return this.emit(e, d);
        }
        default: {
          break;
        }
      }

      if (body && d) this.emit(e, d);
    });

    return true;
  }

  async destroy() {
    this.ws.destroy();
  }
}
