// Store Base
const Util = require('./Util');

// Collection class
class Collection extends Util {
    constructor() {
        super();
    }

    toJSON() {
        return this.map(e => typeof e.toJSON === 'function' ? e.toJSON() : Util.flatten(e));
    }
}

// Export class
module.exports = Collection;