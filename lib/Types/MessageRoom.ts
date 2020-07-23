import House from "./House";
import User from "./User";
import Mention from "./Mention";
import BaseRoom from "./BaseRoom";

export default interface MessageRoom extends BaseRoom {
  description: string | null;
  last_message_id: string;
  permission_overwrites: any;
  position: number;
  recipients: Mention[];
  type: number;
  send?: (content: string) => void;
  typing: any;
  emoji: { type: number; data: string } | null;
}
