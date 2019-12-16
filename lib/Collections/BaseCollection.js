// BaseCollection class
class BaseCollection extends Map {
    constructor() {
        super();
    }

    async resolve(id) {
        return super.get(id);
    }

    toJSON() {
        return this.map(e => typeof e.toJSON === 'function' ? e.toJSON() : Util.flatten(e));
    }
}

// Export class
module.exports = BaseCollection;