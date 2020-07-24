// Collection Base
import { BaseCollection } from './BaseCollection';
import { rest, Client } from '../Client';
import { APIMessage } from '../Types/Message';

// User class
export class User extends BaseCollection {
  private client?: Client;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  collect = (key: string, value: any) => {
    return super.set(key, value);
  };

  destroy = (key: string | number) => {
    return super.delete(key);
  };

  async send(content: string, id: string) {
    let sendMessage = await rest.post<APIMessage>(`/rooms/${id}/messages`, {
      data: { content }
    });

    let message = {
      id: sendMessage.id,
      content: sendMessage.content,
      timestamp: new Date(sendMessage.timestamp),
      room: this.client?.rooms.resolve(sendMessage.room_id),
      house: this.client?.houses.resolve(sendMessage.house_id),
      author: this.client?.users.resolve(sendMessage.author_id)
    };

    let collect = await this.client?.messages.collect(message.id, message);

    return collect;
  }
}
