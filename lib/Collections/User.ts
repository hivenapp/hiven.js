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

  Collect = (key: string | number, value: any) => {
    return super.set(key, value);
  };

  Delete = (key: string | number) => {
    return super.delete(key);
  };

  async Send(content: string, id: string) {
    let sendMessage = await rest.post<APIMessage>(`/rooms/${id}/messages`, {
      data: { content }
    });

    let message = {
      id: sendMessage.id,
      content: sendMessage.content,
      timestamp: new Date(sendMessage.timestamp),
      room: this.client?.rooms.Get(sendMessage.room_id),
      house: this.client?.houses.Get(sendMessage.house_id),
      author: this.client?.users.Get(sendMessage.author_id)
    };

    let collect = await this.client?.messages.Collect(message.id, message);

    return collect;
  }
}
