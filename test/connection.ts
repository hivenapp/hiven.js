import Hiven from '../lib'
import MessageRoom from '../lib/Types/MessageRoom'
import Message from '../lib/Types/Message'

const client = new Hiven.Client({ clientType: 'user' });

client.connect("your token")

client.on('ready', () => {
  console.log("Connected to Hiven Swarm!")
})

client.on('MESSAGE_CREATE', (msg) => {
  console.log(`Received message: ${msg.content} from ${msg.author.username}`)
})