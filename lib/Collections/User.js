// Collection Base
const BaseCollection = require('./BaseCollection');

// User class
class User extends BaseCollection {
    constructor() {
        super();
    }

    async send(content) {
        // Send the message to the api
        let sendMessage = await global.rest.post(`/rooms/${this.id}/messages`, { data: { content } });

        let message = {
            id: sendMessage.data.data.id,
            content: sendMessage.data.data.content,
            timestamp: new Date(sendMessage.data.data.timestamp),
            room: global.Client.rooms.get(sendMessage.data.data.room_id),
            house: global.Client.houses.get(sendMessage.data.data.house_id),
            author: global.Client.users.get(sendMessage.data.data.author_id)
        };

        let collect = await global.Client.messages.collect(message.id, message);

        return collect;
    }
}

// Export class
module.exports = User;