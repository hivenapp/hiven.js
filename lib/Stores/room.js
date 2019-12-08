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
        if (typeof value == 'object') value.send = this.send;
        this.set(key, value);
    }

    async send(content) {
        // Send the message to the api
        let sendMessage = await global.rest.post(`/houses/${this.house.id}/rooms/${this.id}/messages`, { data: { content } });

        console.log(sendMessage);
    }
}

// Export class
module.exports = Room;