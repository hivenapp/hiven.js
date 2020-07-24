// Collection Base
import { BaseCollection } from './BaseCollection';
import { Client, rest } from '../Client';
import { BaseRoom, APIBaseRoom } from '../Types/Room';
import { House } from './House';
import { Collection } from '../Types/Collection';

export class Room extends BaseCollection implements BaseRoom {
  private client: Client;
  public id: string = '';
  public name: string = '';
  public house?: House;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  /**
   *
   * @param {string} key Object key
   * @param {value} value Object value
   */
  public async collect(key: string, value: any) {
    if (typeof value == 'object') {
      value.send = this.send;
      value.delete = this.delete;
    }
    super.set(key, value);
    return super.get(key);
  }

  /**
   * Send function to send message to room
   * @param {string} content Message contents
   */
  async send(content: string) {
    let sendMessage = await rest.post(`/rooms/${this.id}/messages`, {
      data: { content }
    });
    let message = {
      id: sendMessage.id,
      content: sendMessage.content,
      timestamp: new Date(sendMessage.timestamp),
      room: this.client?.rooms.get(sendMessage.room_id),
      house: this.client?.houses.get(sendMessage.house_id),
      author: this.client?.users.get(sendMessage.author_id)
    };

    let collect = await this.client?.messages.collect(message.id, message);

    return collect;
  }

  create = async (name: string) => {
    if (!this.id) throw 'cannot_call_without_house';
    if (!name) throw 'missing_name';

    // Create Room
    let createRoom = await rest.post<APIBaseRoom>(`/houses/${this.id}/rooms`, {
      data: { name }
    });
    if (!createRoom) throw 'failed_to_create_room';

    this.house?.rooms?.collect(createRoom.id, {
      id: createRoom.id,
      name: createRoom.name,
      house: this,
      position: createRoom.position,
      type: createRoom.type
    });

    return await this.client.rooms.collect(createRoom.id, {
      id: createRoom.id,
      name: createRoom.name,
      house: this,
      position: createRoom.position,
      type: createRoom.type
    });
  };

  async destroy() {
    let deleteRoom = await rest.delete(`/houses/${this.id}/rooms/${this.id}`);
    return deleteRoom;
  }
}
