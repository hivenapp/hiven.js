// Store Base
const Store = require('./Store');

// Room class
class Room extends Store {
    constructor(Client) {
        super();

        this.Client = Client;
        this.rest = global.rest;
    }

    async collect(key, value) {
        if (typeof value == 'object') { value.send = this.send; value.delete = this.delete; }
        super.set(key, value);
        return super.get(key);
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

    async delete() {
        let deleteRoom = await global.rest.delete(`/houses/${this.house.id}/rooms/${this.id}`);
        return deleteRoom;
    }
}

// Export class
module.exports = Room;