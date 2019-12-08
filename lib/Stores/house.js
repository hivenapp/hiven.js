// Store Base
const Store = require('./Store');

// House class
class House extends Store {
    constructor() {
        super();
    }

    async create({ name }) {
        console.log('Create house code', name);
    }
}

// Export class
module.exports = House;