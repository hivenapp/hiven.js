/**
 * A bot that will post in a room when a user joins
 */

// Modules
const Hiven = require('hiven.js');

// Remember to put { clientType: 'user' } in this function call to enable user accounts
const Client = new Hiven.Client();

// This event is emitted when the client successfully authenticates
Client.on('INIT_STATE', () => {
    console.log(`Ready, connected as ${Client.user.username} (${Client.user.id})`);
});

// This event is emitted when a user joins a house
Client.on('HOUSE_MEMBER_JOIN', async member => {
    let room = await Client.rooms.resolve('55494222333080793');

    if (member.house.id !== room.house.id) return;

    console.log(`New member in house ${member.house.name}`);

    room.send(`New member joined: @\`${member.username}\`\nName: \`${member.name}\`\nID: \`${member.id}\``);
});

// Connect to hiven using a token
Client.connect('token_here');