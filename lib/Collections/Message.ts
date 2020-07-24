// Collection Base
import { BaseCollection } from './BaseCollection';
import { rest, Client } from '../Client';
import { House } from './House';
import { Room } from './Room';
import { User } from './User';

// Message class
export class Message extends BaseCollection {
  private client: Client;

  public house?: House;
  public room?: Room;
  public id: string | undefined;
  public content?: string;
  public timestamp?: Date;
  public author?: User;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  Collect(key: string | number, value: any) {
    if (typeof value == 'object') {
      value.Remove = this.Remove;
      value.Edit = this.Edit;
    }
    super.set(key, value);
    return super.get(key);
  }

  Delete(key: string | number) {
    super.delete(key);
  }

  async Remove() {
    let deleteMessage = await rest.delete(`/rooms/${this.room?.id}/messages/${this.id}`);
    return deleteMessage;
  }

  async Edit(content: string) {
    let editMessage = await rest.patch(`/rooms/${this.room?.id}/messages/${this.id}`, { data: { content } });
    return editMessage;
  }
}
