// Collection Base
import { BaseCollection } from './BaseCollection';

import { MessageRoom } from '../Types/Room';
import { rest, Client } from '../Client';
import { Room } from './Room';
import { Member } from './Member';

// House class
export class House extends BaseCollection {
  private client?: Client;
  public rooms?: Room;
  public id?: string;
  public name?: string;
  public owner_id?: string;
  public icon?: string;
  public banner?: string;
  public synced?: boolean;
  public members?: Member;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  Collect<T = any>(key: string, value: any): T {
    if (typeof value == 'object') {
      value.CreateInvite = this.CreateInvite;
      value.Leave = this.Leave;
      value.CreateRoom = this.CreateRoom;
    }
    super.set(key, value);
    return super.get(key);
  }

  async Create(name: string) {
    let createHouse = await rest.post('/houses', {
      data: { name, icon: null }
    });
    return createHouse;
  }

  async CreateInvite(uses: number, age: number) {
    let createInvite = await rest.post(`/houses/${this.id}/invites`, {
      data: { max_uses: uses, max_age: age }
    });
    return createInvite.data.data;
  }

  async CreateRoom(name: string) {
    if (!name) throw 'missing_name';

    // Create Room
    let createRoom = await rest.post<MessageRoom>(`/houses/${this.id}/rooms`, {
      data: { name }
    });
    if (!createRoom) throw 'failed_to_create_room';

    this.rooms?.Collect(createRoom.id, {
      id: createRoom.id,
      name: createRoom.name,
      house: this,
      position: createRoom.position,
      type: createRoom.type
    });

    return await this.client?.rooms.Collect(createRoom.id, {
      id: createRoom.id,
      name: createRoom.name,
      house: this,
      position: createRoom.position,
      type: createRoom.type
    });
  }

  async Join(code: string) {
    let getInvite = await rest.get(`/invites/${code}`);
    if (!getInvite.data) throw 'failed_to_fetch_invite';

    let useInvite = await rest.post(`/invites/${code}`, {});
    if (!useInvite.data) throw 'failed_to_use_invite';

    // Fetch the house from the house store by the ID and return that with the callback
    return await this.Collect(getInvite.data.data.house.id, {
      id: getInvite.data.data.house.id,
      name: getInvite.data.data.house.name,
      owner: this.client?.users.get(getInvite.data.data.house.owner_id),
      icon: getInvite.data.data.house.icon,
      members: getInvite.data.data.house.members,
      rooms: getInvite.data.data.house.rooms
    });
  }

  async Leave() {
    // Leave the house
    let leaveHouse = await rest.delete(`/users/@me/houses/${this.id}`);
    return leaveHouse;
  }

  async Delete() {
    let deleteHouse = await rest.delete(`/houses/${this.id}`);
    return deleteHouse;
  }
}
