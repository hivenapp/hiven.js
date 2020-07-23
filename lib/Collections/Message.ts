// Collection Base
import BaseCollection from "./BaseCollection";
import { rest } from "../Client";

// Message class
export default class Message extends BaseCollection {
  private house;
  private room;
  private id;
  private client;

  constructor(Client) {
    super();
    this.client = Client;
  }

  async collect(key: string | number, value) {
    if (typeof value == "object") {
      value.delete = this.delete;
      value.edit = this.edit;
    }
    super.set(key, value);
    return super.get(key);
  }

  delete(key: string | number) {
    super.delete(key);
  }

  async remove() {
    // Delete the message
    let deleteMessage = await rest.delete(
      `/rooms/${this.room.id}/messages/${this.id}`
    );
    return deleteMessage;
  }

  async edit(content: string) {
    // Edit the message
    let editMessage = await rest.patch(
      `/rooms/${this.room.id}/messages/${this.id}`,
      { data: { content } }
    );
    return editMessage;
  }
}
