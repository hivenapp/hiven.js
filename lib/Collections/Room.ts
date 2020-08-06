// Collection Base
import { BaseCollection } from './BaseCollection';
import { Client, rest, ws } from '../Client';
import { APIBaseRoom } from '../Types/Room';
import { House } from './House';
import { Voice } from '../Voice';
import { Message } from './Message';
import { User } from './User';
import { SnowflakeToDate } from '../Utils/Snowflake';

export declare interface Room {
  id: string;
  name: string;
  content: string;
  timestamp: Date;
  room: Room;
  house: House;
  author: User;
  messages: Message;
  recipients: User;
  created: Date;
}

export class Room extends BaseCollection {
  public client: Client;
  join_token?: string;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  /**
   *
   * @param {string} key Object key
   * @param {value} value Object value
   */
  public collect<T = any>(key: string, value: any): T {
    if (typeof value == 'object') {
      if (value.id && SnowflakeToDate(value.id)) value.created = SnowflakeToDate(value.id);
      value.client = this.client;
      value.send = this.send;
      value.delete = this.delete;
      value.join = this.join;
      value.leave = this.leave;
      value.startTyping = this.startTyping;
    }
    super.set(key, value);
    return super.get(key);
  }

  /**
   * Send function to send message to room
   * @param {string} content Message contents
   */
  async send(content: string): Promise<Message> {
    const sendMessage = await rest.post(`/rooms/${this.id}/messages`, {
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

    const collect = this.client?.messages.collect<Message>(message.id, message);

    return collect;
  }

  create = async (name: string): Promise<Room> => {
    if (!this.id) throw 'cannot_call_without_house';
    if (!name) throw 'missing_name';

    // Create Room
    const createRoom = await rest.post<APIBaseRoom>(`/houses/${this.id}/rooms`, {
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

    return await this.client.rooms.collect<Room>(createRoom.id, {
      id: createRoom.id,
      name: createRoom.name,
      house: this,
      position: createRoom.position,
      type: createRoom.type
    });
  };

  async destroy(): Promise<string> {
    return await rest.delete<string>(`/houses/${this.id}/rooms/${this.id}`);
  }

  async join(): Promise<void> {
    // TODO: Write logic to create call if there is not a call going yet
    // await rest.post<void>(`/rooms/${this.id}/call`);

    // Obtain the voice join token
    await ws.sendOp(4, { id: this.id });

    let timeout: NodeJS.Timeout;
    await Promise.race([
      new Promise((resolve) => (timeout = setTimeout(resolve, 5000))),
      new Promise((resolve) => {
        this.client.once('CALL_CREATE', resolve);
        clearTimeout(timeout);
      })
    ]);

    // Create voice handler and init the connection
    const voice = new Voice();
    console.log(this.client.user, this.join_token);
    voice.init(this.id, this.client?.user?.id || '', this.join_token || '');

    voice.on('data', (data) => {
      console.log('RAW Voice Data', JSON.stringify(data));
    });

    voice.on('connection', (data) => {
      console.log('Connection created', data);
      ws.sendOp(5, { room_id: this.id, muted: false });
    });

    return;
  }

  leave(): void {
    ws.sendOp(5, { room_id: null, muted: false });
  }

  /**
   * Start typing in the room for 10 seconds
   */
  async startTyping(): Promise<void> {
    await rest.post(`/rooms/${this.id}/typing`, {});
  }
}
