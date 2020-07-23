import Member from './Member'
import MessageRoom from './MessageRoom'

export default interface House {
  banner: string | null;
  icon: string | null;
  id: string;
  members: Member[];
  name: string;
  owner_id: string;
  rooms: MessageRoom[];
  synced: boolean;
  unavailable?: boolean;
}
