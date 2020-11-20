// Collection Base
import { BaseCollection } from './BaseCollection';

import { Client, rest } from '../Client';
import { House } from './House';
import { Room } from './Room';
import { User } from './User';

export declare interface Message {
  id: string;
  content: string;
  timestamp: Date;
  room: Room;
  house: House;
  author: User;
}

export class Message extends BaseCollection {
  private client: Client;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  collect<T = any>(key: string, value: any): T {
    if (typeof value == 'object') {
      value.destroy = this.destroy;
      value.edit = this.edit;
    }
    super.set(key, value);
    return super.resolve<T>(key);
  }

  async destroy() {
    const deleteMessage = await rest.delete(`/rooms/${this.room?.id}/messages/${this.id}`);
    return deleteMessage;
  }

  async edit(content: string) {
    const editMessage = await rest.patch(`/rooms/${this.room?.id}/messages/${this.id}`, { data: { content } });
    return editMessage;
  }
}
