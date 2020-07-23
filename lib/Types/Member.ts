import User from './User'

export default interface Member {
  house_id: string;
  id: string;
  joined_at: string;
  presence: string;
  roles: null;
  user: User;
  user_id: string;
}
