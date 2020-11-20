// Collection Base
import { BaseCollection } from './BaseCollection';

import { Client } from '../Client';
import { HouseCollection } from './House';

// Member class
export class MemberCollection extends BaseCollection {
  private client?: Client;
  public id?: string;
  public house?: HouseCollection;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  send = () => {
    return false;
  };

  collect = <T = any>(k: any, v: any): T => {
    super.set(k, v);
    return super.get(k);
  };

  destroy = () => {
    return;
  };
}

// Export class
