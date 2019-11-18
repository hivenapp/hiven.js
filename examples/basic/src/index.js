// Modules
const Hiven = require('hiven.js');

const Client = new Hiven.Client();

Client.on('INIT_STATE', () => {
    console.log(`Ready, connected as ${Client.user.username} (${Client.user.id})`);
});

Client.on('MESSAGE_CREATE', msg => {
    console.log(`MSG : [${msg.room.name}@${msg.house.name}] ${msg.author.username}: ${msg.content}`);
});

Client.connect('noTokenForU');