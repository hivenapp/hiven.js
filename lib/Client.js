// Modules
const EventEmitter = require('events');
const Websocket = require('./Websocket');
const Rest = require('./Rest');

// Collections
const HouseStore = require('./Collections/House');
const MessageStore = require('./Collections/Message');
const MemberStore = require('./Collections/Member');
const RoomStore = require('./Collections/Room');
const UserStore = require('./Collections/User');

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

            // Emits every event to RAW
            let raw = {
                event: body.e,
                description: body.d
            }
            this.emit("RAW", raw);

            // Detect if it'sthe init event to set the user in the instance
            switch (body.e) {
                case 'INIT_STATE':
                    this.user = body.d.user;
                    this.users.set(body.d.user.id, body.d.user);
                    break;
                case 'ROOM_CREATE':
                    // New room created, add it to our cache
                    /* eslint-disable-next-line no-case-declarations */
                    let createRoomHouse = this.houses.get(body.d.house_id);

                    /* eslint-disable-next-line no-case-declarations */
                    let room = {
                        id: body.d.id,
                        name: body.d.name,
                        house: createRoomHouse,
                        position: body.d.position,
                        type: body.d.type,
                        description: body.d.description,
                        permissions: body.d.permission_overwrites,
                        recipients: body.d.recipients
                    };

                    createRoomHouse.rooms = [...createRoomHouse.rooms, { room }];

                    this.rooms.collect(room.id, room);
                    this.homes.collect(createRoomHouse.id, createRoomHouse);
                    break;
                case 'ROOM_UPDATE':
                    // Room has been edited

                    this.emit(body.e, body.d);
                    break;
                case 'ROOM_DELETE':
                    // Room deleted, remove it from our cache
                    /* eslint-disable-next-line no-case-declarations */
                    let rooms = this.houses.get(body.d.house_id).rooms.filter(r => r.id !== body.d.id);

                    this.houses.get(body.d.house_id).rooms = rooms;
                    this.room.destroy(body.d.id);

                    this.emit(body.e, body.d);
                    break;
                case 'MESSAGE_CREATE':
                    /* eslint-disable-next-line no-case-declarations */
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
                case 'MESSAGE_UPDATE':
                    // Room has been edited

                    this.emit(body.e, body.d);
                    break;
                case 'MESSAGE_DELETE':
                    // Message deleted, remove it from our cache

                    this.messages.destroy(body.d.id);
                    this.emit(body.e, body.d);
                    break;
                case 'TYPING_START':
                    this.emit(body.e, body.d);
                    break;
                case 'HOUSE_JOIN':
                    // Define house object
                /* eslint-disable-next-line no-case-declarations */
                    let joinHouse = body.d;

                    // Handle caching members and users
                    /* eslint-disable-next-line no-case-declarations */
                    let members = [];
                    for (let i = 0; i < joinHouse.members.length; i++) {
                        let member = joinHouse.members[i];
                        members.push({
                            id: member.user_id,
                            roles: member.roles,
                            joined: member.joined_at,
                            name: member.user.name,
                            username: member.user.username
                        });

                        this.users.set(member.user.id, member.user);
                    }
                    joinHouse.members = members;

                    /* eslint-disable-next-line no-case-declarations */
                    let newHouse = {
                        id: joinHouse.id,
                        name: joinHouse.name,
                        owner: this.users.get(joinHouse.owner_id),
                        icon: joinHouse.icon,
                        members: joinHouse.members,
                        rooms: joinHouse.rooms
                    };

                    // Cache houses
                    this.houses.collect(joinHouse.id, newHouse);

                    // Final rooms
                    /* eslint-disable-next-line no-case-declarations */
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

                    this.houses.collect(newHouse.id, newHouse);
                    break;
                case 'HOUSE_MEMBER_JOIN':
                    /* eslint-disable-next-line no-case-declarations */
                    let houseJoin = this.houses.get(body.d.house_id);

                    /* eslint-disable-next-line no-case-declarations */
                    let member = {
                        id: body.d.user.id,
                        roles: body.d.roles,
                        joined: body.d.joined_at,
                        name: body.d.user.name,
                        username: body.d.user.username
                    };

                    houseJoin.members.push(member);

                    this.houses.collect(houseJoin.id, houseJoin);
                    this.users.set(body.d.user_id, body.d.user);

                    member.house = houseJoin;

                    return this.emit(body.e, member);
                case 'HOUSE_MEMBER_LEAVE':
                    /* eslint-disable-next-line no-case-declarations */
                    let houseLeave = this.houses.get(body.d.house_id);

                    /* eslint-disable-next-line no-case-declarations */
                    const memberToRemove = houseLeave.members.findIndex(member => member.id == body.d.id);

                    /* eslint-disable-next-line no-case-declarations */
                    let memberLeave = houseLeave.members[memberToRemove];

                    if (memberToRemove) houseLeave.members.slice(memberToRemove, 1);

                    this.houses.collect(houseLeave.id, houseLeave);

                    memberLeave.house = houseLeave;

                    return this.emit(body.e, memberLeave);
                default:
                    break;
            }

            if (body && body.d) this.emit(body.e, body.d);
        });

        return true;
    }

    async destroy() {
        this.ws.destroy();
    }
}

module.exports = Client;