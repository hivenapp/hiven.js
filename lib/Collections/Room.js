// Collection Base
const BaseCollection = require('./BaseCollection');

// Room class
class Room extends BaseCollection {
    constructor(Client) {
        super();

        this.Client = Client;
        this.rest = global.rest;
    }

    /**
     * 
     * @param {string} key Object key
     * @param {value} value Object value
     */
    async collect(key, value) {
        if (typeof value == 'object') { value.send = this.send; value.delete = this.delete; }
        super.set(key, value);
        return super.get(key);
    }

    /**
     * Send function to send message to room
     * @param {string} content Message contents
     */
    async send(content) {
        // Send the message to the api
        let sendMessage = await global.rest.post(`rooms/${this.id}/messages`, { data: { content } });

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

    async create({ name }) {
        if (!this.id) throw 'cannot_call_without_house';
        if (!name) throw 'missing_name';

        // Create Room
        let createRoom = await global.rest.post(`/houses/${this.id}/rooms`, { data: { name } });
        if (!createRoom.data) throw 'failed_to_create_room';

        this.rooms.push({
            id: createRoom.data.data.id,
            name: createRoom.data.data.name,
            house: this,
            position: createRoom.data.data.position,
            type: createRoom.data.data.type
        });

        return await global.Client.rooms.collect(createRoom.data.data.id, {
            id: createRoom.data.data.id,
            name: createRoom.data.data.name,
            house: this,
            position: createRoom.data.data.position,
            type: createRoom.data.data.type
        });
    }

    async delete() {
        let deleteRoom = await global.rest.delete(`/rooms/${this.id}`);
        return deleteRoom;
    }
}

// Export class
module.exports = Room;
