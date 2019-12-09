// Store Base
const Store = require('./Store');

// House class
class House extends Store {
    constructor() {
        super();
    }

    async collect(key, value) {
        if (typeof value == 'object') { value.createInvite = this.createInvite; value.leave = this.leave; }
        super.set(key, value);
        return super.get(key);
    }

    async create({ name }) {
        // Create the house
        let createHouse = await global.rest.post('/houses', { name });
        return createHouse;
    }

    async createInvite({ uses, age } = {}) {
        // Create invite
        let createInvite = await global.rest.post(`/houses/${this.id}/invites`, { data: { max_uses: uses, max_age: age } });
        return createInvite.data.data;
    }

    async join(code) {
        // Join house
        let getInvite = await global.rest.get(`/invites/${code}`);
        if (!getInvite.data) throw 'failed_to_fetch_invite';

        let useInvite = await global.rest.post(`/invites/${code}`);
        if (!useInvite.data) throw 'failed_to_use_invite';

        // Fetch the house from the house store by the ID and return that with the callback
        let House = await this.collect(getInvite.data.data.house.id, {
            id: getInvite.data.data.house.id,
            name: getInvite.data.data.house.name,
            owner: global.Client.users.get(getInvite.data.data.house.owner_id),
            icon: getInvite.data.data.house.icon,
            members: getInvite.data.data.house.members,
            rooms: getInvite.data.data.house.rooms
        });

        return House;
    }

    async leave() {
        // Leave the house
        let leaveHouse = await global.rest.delete(`/users/@me/houses/${this.id}`);
        return leaveHouse;
    }
}

// Export class
module.exports = House;