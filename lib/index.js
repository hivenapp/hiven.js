// Modules
const Websocket = require('./Websocket');
const EventEmitter = require('events');

// Instantiate websocket
const WS = new Websocket();

// Stores
const House = require('./Stores/house');
const Message = require('./Stores/message');
const Member = require('./Stores/member');
const Room = require('./Stores/room');
const User = require('./Stores/user');

// Export functions
class Client extends EventEmitter {
    constructor(options = {}) {
        // Call parent class constructor
        super();

        this.options = options;
        this.users = new User(this);
        this.rooms = new Room(this);
        this.houses = new House(this);
        this.members = new Member(this);
        this.messages = new Message(this);
    }

    async connect(token) {
        // Set the token in the instance
        this.token = token;

        // Connect to the socket
        await WS.init();

        // Auth with the socket
        await WS.sendOp(2, { token });

        WS.on('data', (body) => {
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

                this.rooms.set(room.id, room);
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

                this.messages.set(body.d.id, message);
                return this.emit(body.e, message);
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
                        name: member.user.name
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

                    this.rooms.set(room.id, finalRoom);
                    finalRooms.push(finalRoom);
                }

                // Cahce houses
                delete newHouse.rooms;
                newHouse.rooms = finalRooms;

                this.houses.set(house.id, newHouse);
            }
            
            if (body && body.d) this.emit(body.e, body.d);
        });

        return true;
    }
}

module.exports = { Client };