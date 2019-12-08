// Modules
const Hiven = require('hiven.js');

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
Client.connect(process.env.HIVEN_TOKEN);