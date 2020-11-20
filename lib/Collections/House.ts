// Collection Base
import { BaseCollection } from './BaseCollection';

import { Client, rest } from '../Client';
import { MessageRoom } from '../Types/Room';
import { SnowflakeToDate } from '../Utils/Snowflake';
import { MemberCollection } from './Member';
import { RoomCollection } from './Room';
import { UserCollection } from './User';

export declare interface HouseCollection {
  id: string;
  name: string;
  owner?: UserCollection;
  icon?: string;
  banner?: string;
  synced?: boolean;
  members?: MemberCollection;
  rooms?: RoomCollection;
  created: Date;
}

// House class
export class HouseCollection extends BaseCollection {
  private client?: Client;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  collect<T = any>(key: string, value: any): T {
    if (typeof value == 'object') {
      if (value.id && SnowflakeToDate(value.id)) value.created = SnowflakeToDate(value.id);
      value.createInvite = this.createInvite;
      value.leave = this.leave;
      value.createRoom = this.createRoom;
    }
    super.set(key, value);
    return super.get(key);
  }

  async create(name: string) {
    const createHouse = await rest.post('/houses', {
      data: { name, icon: null }
    });
    return createHouse;
  }

  async createInvite(uses: number, age: number) {
    const createInvite = await rest.post(`/houses/${this.id}/invites`, {
      data: { max_uses: uses, max_age: age }
    });
    return createInvite.data.data;
  }

  async createRoom(name: string) {
    if (!name) throw 'missing_name';

    // Create Room
    const createRoom = await rest.post<MessageRoom>(`/houses/${this.id}/rooms`, {
      data: { name }
    });
    if (!createRoom) throw 'failed_to_create_room';

    this.rooms?.collect(createRoom.id, {
      id: createRoom.id,
      name: createRoom.name,
      house: this,
      position: createRoom.position,
      type: createRoom.type
    });

    return await this.client?.rooms.collect(createRoom.id, {
      id: createRoom.id,
      name: createRoom.name,
      house: this,
      position: createRoom.position,
      type: createRoom.type
    });
  }

  async Join(code: string) {
    const getInvite = await rest.get(`/invites/${code}`);
    if (!getInvite.data) throw 'failed_to_fetch_invite';

    const useInvite = await rest.post(`/invites/${code}`, {});
    if (!useInvite.data) throw 'failed_to_use_invite';

    // Fetch the house from the house store by the ID and return that with the callback
    return await this.collect(getInvite.data.data.house.id, {
      id: getInvite.data.data.house.id,
      name: getInvite.data.data.house.name,
      owner: this.client?.users.resolve(getInvite.data.data.house.owner_id),
      icon: getInvite.data.data.house.icon,
      members: getInvite.data.data.house.members,
      rooms: getInvite.data.data.house.rooms
    });
  }

  async leave() {
    // Leave the house
    const leaveHouse = await rest.delete(`/users/@me/houses/${this.id}`);
    return leaveHouse;
  }

  async destroy() {
    const deleteHouse = await rest.delete(`/houses/${this.id}`);
    return deleteHouse;
  }
}
