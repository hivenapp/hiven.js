import Room from "./MessageRoom";
import House from "./House";
import User from "./User";

export default interface Message {
  id: string;
  content: string;
  timestamp: Date;
  room: Room;
  house: House;
  author: User;
}
