// Collection Base
import { BaseCollection } from './BaseCollection';
import { Client } from '../Client';
import { House } from './House';

// Member class
export class Member extends BaseCollection {
  private client?: Client;
  public id?: string;
  public house?: House;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  Send = () => {
    return false;
  };

  Collect = <T = any>(k: any, v: any): T => {
    super.set(k, v);
    return super.get(k);
  };

  Delete = () => {
    return;
  };
}

// Export class
