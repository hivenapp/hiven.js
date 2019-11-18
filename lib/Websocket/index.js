// Modules
const Websocket = require('ws');
const EventEmitter = require('events');

// Static variables
const SWARM_URL = 'wss://swarm-dev.hiven.io/socket';
const ENCODING = 'json';

// Export functions
class WS extends EventEmitter {
  constructor() {
    super();
  }

  async sendOp(op, data) {
    if (this.ws.readyState != Websocket.OPEN) return false;
    if (data) return this.ws.send(JSON.stringify({ op, d: data }));
    return this.ws.send(JSON.stringify({ op }));
  }

  async startHeartbeat(int) {
    this.heartbeatInterval = setInterval(async () => this.sendOp(3), int);
  }

  async init() {
    return new Promise((resolve) => {
      this.ws = new Websocket(`${SWARM_URL}?encoding=${ENCODING}`);
  
      this.ws.on('open', () => {
        return resolve(true);
      });

      this.ws.on('message', async data => {
        try {
          let body = JSON.parse(data);

          // Detect if connnection packet
          if (body.op == 1 && body.d && body.d.hbt_int) {
            // This is the heartbeat ping, starting int
            await this.startHeartbeat(body.d.hbt_int);
          }

          this.emit('data', body);
        } catch (error) { } /* eslint-disable-line no-empty */
      });
    });
  }
}

module.exports = WS;