// Collection Base
const BaseCollection = require('./BaseCollection');

// Message class
class Message extends BaseCollection {
    constructor() {
        super();
    }

    async collect(key, value) {
        if (typeof value == 'object') { value.delete = this.delete; value.edit = this.edit; }
        super.set(key, value);
        return super.get(key);
    }

    async destroy(key, value) {
        return super.delete(key, value);
    }

    async delete() {
        // Delete the message
        console.log(this.id, this.house, this.room);
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