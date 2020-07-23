// Collection Base
import BaseCollection from "./BaseCollection";

// Member class
export default class Member extends BaseCollection {
  private client;
  constructor(Client) {
    super();
    this.client = Client;
  }

  collect = (k, v) => {
    return super.set(k, v);
  };

  destroy = () => {
    return;
  };
}

// Export class
