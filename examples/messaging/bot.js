// Modules
const Hiven = require('hiven.js');

const Client = new Hiven.Client();

// This event is emitted when the client successfully authenticates
Client.on('INIT_STATE', () => {
    console.log(`Ready, connected as ${Client.user.username} (${Client.user.id})`);
});

// This event is emitted when the client receives a message
Client.on('MESSAGE_CREATE', async msg => {
    if (msg.content.toLowerCase() == '!delete') {
        let message = await msg.room.send(`Deleting this message in like 5 seconds`);

        setTimeout(async () => {
            await message.delete();
        }, 5000);
    }

    if (msg.content.toLowerCase() == '!edit') {
        let message = await msg.room.send(`Editing this message in 5 seconds.`);

        setTimeout(async () => {
            await message.edit('HEY!');
        }, 5000);
    }
});

// Connect to hiven using a token
Client.connect(process.env.HIVEN_TOKEN);