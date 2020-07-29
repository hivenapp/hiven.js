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
export declare let ws: WS;
export declare let client: Client;

interface ClientOptions {
  type: string;
}

export declare interface Client {
  on(event: 'message', listener: (msg: Message) => void): this;
  on(event: string, listener: Function): this;
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
    ws = this.ws;

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
    if (this.options.type === 'bot') this.token = `Bot ${token}`;
    else this.token = token;

    this.rest.init(this);

    // Connect to the socket
    await this.ws.init();

    // Auth with the socket
    await this.ws.sendOp(2, { token: this.token });

    this.ws.on('data', (body) => {
      const { e, d } = body;
      // Emits every event to RAW
      const raw = {
        event: e,
        data: d
      };
      this.emit('RAW', raw);

      // Detect if it's the init event to set the user in the instance
      switch (e) {
        case 'INIT_STATE': {
          this.user = d.user;
          this.users.collect(d.user.id, d.user);
          d.private_rooms.forEach((room: APIBaseRoom) => {
            const house: House | undefined = this.houses.resolve<House>(d.house_id);

            this.rooms.collect(room.id, {
              id: room.id,
              name: room.name,
              house: house,
              position: room.position,
              type: room.type,
              description: room.description,
              permission_overwrites: room.permission_overwrites,
              recipients: room.recipients,
              typing: room.typing,
              last_message_id: room.last_message_id,
              emoji: room.emoji
            });
          });

          this.emit('init', d);
          return this.emit(e, d);
        }
        case 'ROOM_CREATE': {
          const createRoomHouse: House | undefined = this.houses.resolve<House>(d.house_id);

          const finalRoom: BaseRoom = {
            id: d.id,
            name: d.name,
            house: createRoomHouse,
            position: d.position,
            type: d.type,
            description: d.description,
            permission_overwrites: d.permission_overwrites,
            recipients: d.recipients,
            typing: d.typing,
            last_message_id: d.last_message_id,
            emoji: d.emoji
          };

          this.rooms.collect(d.id, finalRoom);

          if (createRoomHouse) {
            createRoomHouse?.rooms?.collect(d.id, finalRoom);
            this.houses.collect(createRoomHouse?.id || '', createRoomHouse);
          }

          this.emit('room_create', d);
          return this.emit(e, d);
        }
        case 'ROOM_UPDATE': {
          this.emit('room_update', d);
          return this.emit(e, d);
        }
        case 'ROOM_DELETE': {
          const rooms: Room | undefined = this.houses.resolve<House>(d.house_id).rooms?.resolve<Room>(d.id);

          this.houses.resolve<House>(d.house_id).rooms = rooms;
          this.rooms.delete(d.id);

          this.emit('room_delete', d);
          return this.emit(e, d);
        }
        case 'MESSAGE_CREATE': {
          const house = this.houses.resolve<HouseStore>(d.house_id);

          const collect_message = this.messages.collect(d.id, {
            id: d.id,
            content: d.content,
            timestamp: new Date(d.timestamp),
            room: this.rooms.resolve<Room>(d.room_id),
            house: this.houses.resolve<House>(d.house_id),
            author: this.users.resolve<User>(d.author_id),
            member: house?.members?.resolve<Member>(d.author_id)
          });

          this.emit('message', collect_message);
          return this.emit(e, collect_message);
        }
        case 'MESSAGE_UPDATE': {
          this.emit('message_update', d);
          return this.emit(e, d);
        }
        case 'MESSAGE_DELETE': {
          this.messages.delete(d.id);
          this.emit('message_delete', d);
          return this.emit(e, d);
        }
        case 'TYPING_START': {
          this.emit('typing_start', d);
          return this.emit(e, d);
        }
        case 'HOUSE_JOIN': {
          const joinHouse = d;
          let house = this.houses.resolve<HouseStore>(joinHouse.id);
          if (!house)
            house = this.houses.collect<House>(joinHouse.id, {
              id: joinHouse.id,
              name: joinHouse.name,
              members: new MemberStore(client),
              rooms: new RoomStore(client)
            });

          d.rooms.forEach(async (room: APIBaseRoom) => {
            const finalRoom: BaseRoom = {
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
            this.rooms.collect(room.id, finalRoom);
            house.rooms?.collect(room.id, finalRoom);
          });

          d.members.forEach(async (member: APIMember) => {
            house.members?.collect(member.id, {
              id: member.id,
              roles: member.roles,
              last_message_id: member.last_message_id,
              house,
              user: this.users.resolve(member.id)
            });
            this.users.collect(member.id, member.user);
            this.members.collect(member.id, member.user);
          });

          // Cache houses
          this.houses.collect(house.id || '', {
            id: house.id,
            name: house.name,
            owner: this.users.resolve(house.owner_id || ''),
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
          const houseJoin: House = this.houses.resolve<House>(d.house_id);
          const member: Member = d;

          houseJoin.members?.collect(member.id, {
            id: member.id,
            house: houseJoin
          });

          this.houses.collect(houseJoin.id || '', houseJoin);
          this.users.collect(d.user_id, d.user);

          this.emit('house_member_join', d);
          return this.emit(e, member);
        }
        case 'HOUSE_MEMBER_LEAVE': {
          // Soon
          this.emit('house_member_leave', d);
          return this.emit(e, d);
        }
        case 'CALL_CREATE': {
          const room: BaseRoom = this.rooms.resolve<BaseRoom>(d.room_id);

          room.join_token = d.join_token;

          this.emit('call_create', d);
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
