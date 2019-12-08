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
    }

    async send(content) {
        // Send the message to the api
        let sendMessage = await global.rest.post(`/houses/${this.house.id}/rooms/${this.id}/messages`, { data: { content } });

        return sendMessage;
    }
}

// Export class
module.exports = Room;