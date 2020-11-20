import { UserCollection } from '../Collections/User';

export interface Member {
  house_id: string;
  id: string;
  joined_at: string;
  presence: string;
  roles: null;
  user: UserCollection;
  user_id: string;
}

export interface APIMember {
  id: string;
  house_id: string;
  user_id: string;
  joined_at: string;
  presence: string;
  roles?: null;
  user: UserCollection;
  last_message_id?: string;
}
