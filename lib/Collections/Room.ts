// Collection Base
import BaseCollection from "./BaseCollection";
import Client, { client, rest } from "../Client";
// Room class
export default class Room extends BaseCollection {
  private client: Client;
  private id;
  private rooms;

  constructor(Client: Client) {
    super();
    this.client = Client;
  }

  /**
   *
   * @param {string} key Object key
   * @param {value} value Object value
   */
  async collect(key: string | number, value: any) {
    if (typeof value == "object") {
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
      data: { content },
    });
    let message = {
      id: sendMessage.data.data.id,
      content: sendMessage.data.data.content,
      timestamp: new Date(sendMessage.data.data.timestamp),
      room: client.rooms.get(sendMessage.data.data.room_id),
      house: client.houses.get(sendMessage.data.data.house_id),
      author: client.users.get(sendMessage.data.data.author_id),
    };

    let collect = await client.messages.collect(message.id, message);

    return collect;
  }

  async create(name: string) {
    if (!this.id) throw "cannot_call_without_house";
    if (!name) throw "missing_name";

    // Create Room
    let createRoom = await rest.post(`/houses/${this.id}/rooms`, {
      data: { name },
    });
    if (!createRoom.data) throw "failed_to_create_room";

    this.rooms.push({
      id: createRoom.data.data.id,
      name: createRoom.data.data.name,
      house: this,
      position: createRoom.data.data.position,
      type: createRoom.data.data.type,
    });

    return await client.rooms.collect(createRoom.data.data.id, {
      id: createRoom.data.data.id,
      name: createRoom.data.data.name,
      house: this,
      position: createRoom.data.data.position,
      type: createRoom.data.data.type,
    });
  }

  async delete() {
    let deleteRoom = await rest.delete(`/houses/${this.id}/rooms/${this.id}`);
    return deleteRoom;
  }
}
