// Modules
const EventEmitter = require('events');
const Websocket = require('./Websocket');
const Rest = require('./Rest');

// Stores
const HouseStore = require('./Stores/House');
const MessageStore = require('./Stores/Message');
const MemberStore = require('./Stores/Member');
const RoomStore = require('./Stores/Room');
const UserStore = require('./Stores/User');

// Export functions
class Client extends EventEmitter {
    constructor(options = { clientType: 'bot' }) {
        // Call parent class constructor
        super();

        this.options = options;

        // Websocket
        this.ws = new Websocket();

        // Rest
        this.rest = new Rest();
        global.rest = this.rest;

        this.users = new UserStore(this);
        this.rooms = new RoomStore(this);
        this.houses = new HouseStore(this);
        this.members = new MemberStore(this);
        this.messages = new MessageStore(this);

        global.Client = this;
    }
    
    async connect(token) {
        // Set the token in the instance
        if (this.options.clientType === 'bot') this.token = `Bot ${token}`
        else this.token = token;

        this.rest.init(this);

        // Connect to the socket
        await this.ws.init();

        // Auth with the socket
        await this.ws.sendOp(2, { token: this.token });

        this.ws.on('data', (body) => {
            // Detect if it's the init event to set the user in the instance
            if (body.e == 'INIT_STATE') {
                this.user = body.d.user;
                this.users.set(body.d.user.id, body.d.user);
            }

            if (body.e == 'ROOM_CREATE') {
                // New room created, add it to our cache
                let house = this.houses.get(body.d.house_id);

                let room = {
                    id: body.d.id,
                    name: body.d.name,
                    house,
                    position: body.d.position,
                    type: body.d.type,
                    description: body.d.description,
                    permissions: body.d.permission_overwrites,
                    recipients: body.d.recipients
                };

                house.rooms = [...house.rooms, {}];

                this.rooms.collect(room.id, room);
                this.homes.set(house.id, house);
            }

            if (body.e == 'MESSAGE_CREATE') {
                let message = {
                    id: body.d.id,
                    content: body.d.content,
                    timestamp: new Date(body.d.timestamp),
                    room: this.rooms.get(body.d.room_id),
                    house: this.houses.get(body.d.house_id),
                    author: this.users.get(body.d.author_id)
                };

                this.messages.collect(body.d.id, message);
                return this.emit(body.e, this.messages.get(body.d.id));
            }

            if (body.e == 'HOUSE_JOIN') {
                // Define house object
                let house = body.d;

                // Handle caching members and users
                let members = [];
                for (let i = 0; i < house.members.length; i++) {
                    let member = house.members[i];
                    members.push({
                        id: member.user_id,
                        roles: member.roles,
                        joined: member.joined_at,
                        name: member.user.name,
                        username: member.user.username
                    });

                    this.users.set(member.user.id, member.user);
                }
                house.members = members;

                let newHouse = {
                    id: house.id,
                    name: house.name,
                    owner: this.users.get(house.owner_id),
                    members: house.members,
                    rooms: house.rooms
                };

                // Cache houses
                this.houses.set(house.id, newHouse);

                // Final rooms
                let finalRooms = [];

                // Handle caching rooms
                for (let i = 0; i < body.d.rooms.length; i++) {
                    let room = body.d.rooms[i];
                    let house = this.houses.get(room.house_id);

                    let finalRoom = {
                        id: room.id,
                        name: room.name,
                        house,
                        position: room.position,
                        type: room.type,
                        description: room.description,
                        permissions: room.permission_overwrites,
                        recipients: room.recipients
                    };

                    this.rooms.collect(room.id, finalRoom);
                    finalRooms.push(finalRoom);
                }

                // Cahce houses
                delete newHouse.rooms;
                newHouse.rooms = finalRooms;

                this.houses.set(house.id, newHouse);
            }

            if (body.e == 'HOUSE_MEMBER_JOIN') {
                let house = this.houses.get(body.d.house_id);

                let member = {
                    id: body.d.user.id,
                    roles: body.d.roles,
                    joined: body.d.joined_at,
                    name: body.d.user.name,
                    username: body.d.user.username
                };

                house.members.push(member);

                this.houses.set(house.id, house);
                this.users.set(body.d.user_id, body.d.user);

                member.house = house;

                return this.emit(body.e, member);
            }

            if (body.e == 'HOUSE_MEMBER_LEAVE') {
                let house = this.houses.get(body.d.house_id);

                const memberToRemove = house.members.findIndex(member => member.id == body.d.id);
                
                let member = house.members[memberToRemove];

                if (memberToRemove) house.members.slice(memberToRemove, 1);

                this.houses.set(house.id, house);

                member.house = house;

                return this.emit(body.e, member);
            }

            if (body && body.d) this.emit(body.e, body.d);
        });

        return true;
    }

    async join(code) {
        await this.rest.post(`/invites/${code}`);
        // console.log(useInvite);
    }
}

module.exports = Client;