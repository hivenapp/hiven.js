export interface APIMessage {
  id: string;
  content: string;
  timestamp: Date;
  room_id: string;
  house_id: string;
  author_id: string;
}

export interface MessageMention {
  username: string;
  user_flags: string;
  name: string;
  id: string;
  icon: string;
  bot: boolean;
}

export interface MessageAttachment {
  media_url: string;
  filename: string;
  dimensions: {
    width: number | null;
    type: string | null;
    height: number | null;
  };
}
