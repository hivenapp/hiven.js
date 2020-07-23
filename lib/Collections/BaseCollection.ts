// BaseCollection class
export default class BaseCollection {
  private map: any;

  constructor() {
    this.map = new Map();
  }

  async resolve(id) {
    return this.map.get(id);
  }

  delete(k) {
    return this.map.delete(k);
  }

  set(k, v) {
    return this.map.set(k, v);
  }

  get(k) {
    return this.map.get(k);
  }

  async toJSON() {
    return this.map.flatten((e) =>
      typeof e.toJSON === "function" ? e.toJSON() : null
    );
  }
}
