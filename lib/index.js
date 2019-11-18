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
    constructor() {
        // Call parent class constructor
        super();

        this.users = new User();
        this.members = new Member();
        this.houses = new House();
        this.messages = new Message();
        this.rooms = new Room();
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
                // Handle caching rooms
                for (let i = 0; i < body.d.rooms.length; i++) {
                    let room = body.d.rooms[i];
                    this.rooms.set(room.id, {
                        id: room.id,
                        name: room.name,
                        house: room.house,
                        position: room.position,
                        type: room.type,
                        description: room.description,
                        permissions: room.permission_overwrites,
                        recipients: room.recipients
                    });
                }

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

                // Delete extra useless variables
                delete house.rooms;

                // Cahce houses
                this.houses.set(house.id, house);
            }
            
            if (body && body.d) this.emit(body.e, body.d);
        });

        return true;
    }
}

module.exports = { Client };