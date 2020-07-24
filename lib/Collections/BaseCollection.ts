export class BaseCollection extends Map {
  constructor() {
    super();
  }

  get<T = any>(id: string): T {
    return super.get(id);
  }

  set<T = any>(id: string, value: any): T {
    super.set(id, value);
    return super.get(id);
  }

  resolve<T = any>(id: string): T {
    return super.get(id);
  }
}
