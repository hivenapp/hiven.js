// Modules
import { EventEmitter } from 'events';
import Rest from './Rest/index';
import { WS } from './Websocket';

// Collections
import { HouseCollection as HouseStore } from './Collections/House';
import { MemberCollection as MemberStore } from './Collections/Member';
import { MessageCollection as MessageStore } from './Collections/Message';
import { RoomCollection as RoomStore } from './Collections/Room';
import { UserCollection, UserCollection as UserStore } from './Collections/User';

// Types
import { HouseCollection } from './Collections/House';
import { MemberCollection } from './Collections/Member';
import { MessageCollection } from './Collections/Message';
import { RoomCollection } from './Collections/Room';
import { ClientUser } from './Types/ClientUser';
import { APIMember } from './Types/Member';
import { APIBaseRoom, BaseRoom } from './Types/Room';
import { ClientEvents, HouseMessage, RawEventBody } from './Types/Events';

import { enumerable } from './Utils/decorators';

export declare let rest: Rest;
export declare let ws: WS;
export declare let client: Client;

export interface ClientOptions {
  type: string;
}

export interface Client {
  on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
  on<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    listener: (...args: any[]) => void,
  ): this;

  once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
  once<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    listener: (...args: any[]) => void,
  ): this;

  emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
  emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: any[]): boolean;

  off<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
  off<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    listener: (...args: any[]) => void,
  ): this;

  removeAllListeners<K extends keyof ClientEvents>(event?: K): this;
  removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ClientEvents>): this;
}
export class Client extends EventEmitter {

  public ws: WS;
  public rest: Rest;
  public users: UserCollection;
  public rooms: RoomCollection;
  public houses: HouseCollection;
  public members: MemberCollection;
  public messages: MessageCollection;
  public options: ClientOptions;
  public user?: ClientUser;

  @enumerable(false)
  public token?: string;

  constructor(options: ClientOptions = { type: 'bot' }) {
    super();

    this.options = options;

    this.ws = new WS();
    ws = this.ws;

    this.rest = new Rest(this);
    rest = this.rest;
    client = this;

    this.users = new UserStore(this);
    this.rooms = new RoomStore(this);
    this.houses = new HouseStore(this);
    this.members = new MemberStore(this);
    this.messages = new MessageStore(this);
  }

  async connect(token: string): Promise<void> {
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
      const raw: RawEventBody = {
        event: e,
        data: d
      };
      this.emit('RAW', raw);

      switch (e) {
        case 'INIT_STATE': {
          this.user = d.user;
          this.users.collect(d.user.id, d.user);
          d.private_rooms.forEach((room: APIBaseRoom) => {
            const house: HouseCollection | undefined = this.houses.resolve<HouseCollection>(d.house_id);

            const collectRoom = {
              id: room.id,
              name: room.name,
              house: house,
              position: room.position,
              type: room.type,
              description: room.description,
              permission_overwrites: room.permission_overwrites,
              recipients: new UserStore(client),
              typing: room.typing,
              last_message_id: room.last_message_id,
              emoji: room.emoji,
              messages: new MessageStore(client)
            };

            room.recipients?.forEach((recipient) => {
              this.users.collect(recipient.id, recipient);
              collectRoom.recipients.collect(recipient.id, recipient);
            });

            this.rooms.collect(room.id, collectRoom);
          });

          this.emit('init', d);
          return this.emit(e, d);
        }
        case 'ROOM_CREATE': {
          const createRoomHouse: HouseCollection | undefined = this.houses.resolve<HouseCollection>(d.house_id);

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
            emoji: d.emoji,
            messages: new MessageStore(client)
          };

          this.rooms.collect(d.id, finalRoom);

          if (createRoomHouse) {
            createRoomHouse?.rooms?.collect(d.id, finalRoom);
            this.houses.collect(createRoomHouse?.id || '', createRoomHouse);
          }

          this.emit('room_create', finalRoom);
          return this.emit(e, d);
        }
        case 'ROOM_UPDATE': {
          this.emit('room_update', d);
          return this.emit(e, d);
        }
        case 'ROOM_DELETE': {
          const rooms: RoomCollection | undefined = this.houses.resolve<HouseCollection>(d.house_id).rooms?.resolve<RoomCollection>(d.id);

          this.houses.resolve<HouseCollection>(d.house_id).rooms = rooms;
          this.rooms.delete(d.id);

          this.emit('room_delete', d);
          return this.emit(e, d);
        }
        case 'MESSAGE_CREATE': {
          try {
            const house = this.houses.resolve<HouseStore>(d.house_id);
            const room = this.rooms.resolve<RoomCollection>(d.room_id);

            const message: HouseMessage = {
              id: d.id,
              room,
              content: d.content,
              timestamp: new Date(d.timestamp),
              house,
              author: this.users.resolve<UserCollection>(d.author_id),
              member: house?.members?.resolve<MemberCollection>(d.author_id)
            };

            if (room) room.messages.collect(message.id, message);

            this.messages.collect(d.id, message);

            this.emit('message', message);
            return this.emit(e, message);
          } catch (error) {
            console.log(error);
          }
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
            house = this.houses.collect<HouseCollection>(joinHouse.id, {
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
              emoji: room.emoji,
              messages: new MessageStore(client)
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
            owner: this.users.resolve(joinHouse.owner_id) || joinHouse.owner_id,
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
          const houseJoin: HouseCollection = this.houses.resolve<HouseCollection>(d.house_id);
          const member: MemberCollection = d;

          houseJoin.members?.collect(member.id, {
            id: member.id,
            house: houseJoin
          });

          this.houses.collect(houseJoin.id || '', houseJoin);
          this.users.collect(d.user_id, d.user);

          this.emit('house_member_join', member);
          return this.emit(e, d);
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
  }

  destroy(): void {
    this.ws.destroy();
  }
}
