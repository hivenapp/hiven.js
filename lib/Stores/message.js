// Store Base
const Store = require('./Store');

// Message class
class Message extends Store {
    constructor() {
        super();
    }

    async collect(key, value) {
        if (typeof value == 'object') value.delete = this.delete;
        this.set(key, value);
        return this.get(key);
    }

    async delete() {
        // Delete the message
        let deleteMessage = await global.rest.delete(`/houses/${this.house.id}/rooms/${this.room.id}/messages/${this.id}`);
        return deleteMessage;
    }
}

// Export class
module.exports = Message;