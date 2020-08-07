import { MessageAttachment, MessageMention } from './Message';
import { PrivateRoom } from './Room';
import { User } from '../Collections/User';

interface Event {
  room_id: string;
  house_id: string;
}

export interface Init {
  user: User;
  settings: object;
  relationships: object;
  read_state: {
    [id: string]: {
      message_id: string;
      mention_count: number;
    };
  };
  private_rooms: PrivateRoom[];
  presences: object;
  house_ids: string[];
}

export interface TypingStart extends Event {
  author_id: string;
  timestamp: number;
}

export interface MessageUpdate extends Event {
  author_id: string;
  type: number;
  timestamp: string;
  metadata: null;
  mentions: MessageMention[];
  id: string;
  exploding_age?: any;
  exploding: boolean;
  embed?: any;
  edited_at: string;
  device_id: string;
  content: string;
  bucket: number;
  attachment?: MessageAttachment;
}

export interface MessageDelete extends Event {
  message_id: string;
}
