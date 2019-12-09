// Store Base
const Store = require('./Store');

// Room class
class Room extends Store {
    constructor(Client) {
        super();

        this.Client = Client;
        this.rest = global.rest;
    }

    // Resolve room by ID
    async resolve(id) {
        return this.get(id);
    }

    async collect(key, value) {
        if (typeof value == 'object') value.send = this.send;
        this.set(key, value);
        return this.get(key);
    }

    async send(content) {
        // Send the message to the api
        let sendMessage = await global.rest.post(`/houses/${this.house.id}/rooms/${this.id}/messages`, { data: { content } });

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
module.exports = Room;