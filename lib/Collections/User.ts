// Collection Base
import { BaseCollection } from './BaseCollection';
import { rest, Client } from '../Client';
import { APIMessage } from '../Types/Message';
import { Message } from './Message';

export declare interface User {
  id: string;
  name: string;
  username: string;
  bot: boolean;
}

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

  async send(content: string, id: string): Promise<Message> {
    const sendMessage = await rest.post<{ data: APIMessage }>(`/rooms/${id}/messages`, {
      data: { content }
    });

    const message = {
      id: sendMessage.data.id,
      content: sendMessage.data.content,
      timestamp: new Date(sendMessage.data.timestamp),
      room: this.client?.rooms.get(sendMessage.data.room_id),
      house: this.client?.houses.get(sendMessage.data.house_id),
      author: this.client?.users.get(sendMessage.data.author_id)
    };

    const collect = await this.client?.messages.collect(message.id, message);

    return collect;
  }
}
