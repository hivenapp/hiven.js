// Store class
class Store extends Map {
    constructor() {
        super();
    }

    async resolve(id) {
        return super.get(id);
    }
}

// Export class
module.exports = Store;