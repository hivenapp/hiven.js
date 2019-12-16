// Collection Base
const BaseCollection = require('./BaseCollection');

// User class
class User extends BaseCollection {
    constructor() {
        super();
    }
}

// Export class
module.exports = User;