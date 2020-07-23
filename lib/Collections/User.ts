// Collection Base
import BaseCollection from "./BaseCollection";
import { rest } from "../Client";
import { client } from "../Client";
// User class
export default class User extends BaseCollection {
  private client;
  constructor(Client) {
    super();
    this.client = Client;
  }

  collect = (key: string | number, value: any) => {
    return super.set(key, value);
  };

  destroy = (key: string | number) => {
    return super.delete(key);
  };

  async send(content: string, id: string) {
    // Send the message to the api
    let sendMessage = await rest.post(`/rooms/${id}/messages`, {
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
}
