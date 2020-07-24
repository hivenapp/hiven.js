import { Client } from 'hiven';

const client = new Client({ type: 'user' });

client.on('ready', async (data) => {
  console.log(`Ready, connected as ${client.user.username} (${client.user.id})`);
});

client.on('message', async (msg) => {
  console.log(`MSG : [${msg.room.name ? msg.room.name : 'unamed'}:${msg.room.id}@${msg.house ? msg.house.name : 'DM'}:${msg.house ? msg.house.id : ''}] ${msg.author.username}: ${msg.content}`);

  if (msg.author.id != client.user.id) return;
  if (!msg.content.startsWith('!')) return;

  let command = msg.content.split(' ')[0].split('!')[1];
  let raw = msg.content.split(`${command}`)[1].substring(1);
  let args = raw.split(' ');
  args.unshift();

  if (command == 'test') {
    msg.Edit('Test success');
  } else if (command == 'eval') {
    try {
      let evaluation = (() => {
        return eval(raw);
      })();

      msg.Edit(`Evaluation complete!\n\nInput:\n\`\`\`js\n${raw}\n\`\`\`\nOutput:\n\`\`\`\n${evaluation}\n\`\`\``);
    } catch (error) {
      msg.Edit(`Evaluation failed!\n\nInput:\n\`\`\`js\n${raw}\n\`\`\`\nOutput:\n\`\`\`\n${error}\n\`\`\``);
    }
  }
});

client.Connect(process.env.TOKEN);
