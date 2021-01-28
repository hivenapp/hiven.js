import { Client } from 'hiven';

const client = new Client({ type: 'user' });

const prefix = '!';

client.on('init', () => {
  console.log(`Ready, connected as ${client.user.username} (${client.user.id})`);
});

client.on('message', async (msg) => {
  console.log(`MSG : [${msg.room.name ? msg.room.name : 'unnamed'}:${msg.room.id}@${msg.house ? msg.house.name : 'DM'}:${msg.house ? msg.house.id : ''}] ${msg.author.username}: ${msg.content}`);

  if (msg.author.id != client.user.id) return;
  if (!msg.content.startsWith(prefix)) return;

  const [command, ...args] = msg.content
    .slice(prefix.length)
    .trim()
    .split(' ');

  if (command == 'test') {
    msg.edit('Test success');
  } else if (command == 'eval') {
    try {
      const result = eval(args.join(' '));

      msg.edit(`Evaluation complete!\n\nInput:\n\`\`\`js\n${args.join(' ')}\n\`\`\`\nOutput:\n\`\`\`\n${result}\n\`\`\``);
    } catch (error) {
      msg.edit(`Evaluation failed!\n\nInput:\n\`\`\`js\n${args.join(' ')}\n\`\`\`\nOutput:\n\`\`\`\n${error}\n\`\`\``);
    }
  }
});

client.connect(process.env.TOKEN);
