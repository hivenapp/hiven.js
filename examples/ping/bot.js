// Modules
const Hiven = require('hiven.js');

const Client = new Hiven.Client();

// This event is emitted when the client successfully authenticates
Client.on('INIT_STATE', () => {
    console.log(`Ready, connected as ${Client.user.username} (${Client.user.id})`);
});

// This event is emitted when the client receives a message
Client.on('MESSAGE_CREATE', msg => {
    if (msg.content.toLowerCase() == '!ping') {
        msg.room.send('Pong!');
    }
});

// Connect to hiven using a token
Client.connect(process.env.HIVEN_TOKEN);