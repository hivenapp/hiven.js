// Store Base
const Store = require('./Store');

// Message class
class Message extends Store {
    constructor() {
        super();
    }

    async collect(key, value) {
        if (typeof value == 'object') { value.delete = this.delete; value.edit = this.edit; }
        super.set(key, value);
        return super.get(key);
    }

    async delete() {
        // Delete the message
        let deleteMessage = await global.rest.delete(`/houses/${this.house.id}/rooms/${this.room.id}/messages/${this.id}`);
        return deleteMessage;
    }

    async edit(content) {
        // Edit the message
        let editMessage = await global.rest.patch(`/houses/${this.house.id}/rooms/${this.room.id}/messages/${this.id}`, { data: { content } });
        return editMessage;
    }
}

// Export class
module.exports = Message;