export class BaseCollection extends Map {
  constructor() {
    super();
  }

  Get<T = any>(id: string): T {
    return super.get(id);
  }

  Set<T = any>(id: string, value: any): T {
    super.set(id, value);
    return super.get(id);
  }

  Resolve<T = any>(id: string): T {
    return super.get(id);
  }
}
