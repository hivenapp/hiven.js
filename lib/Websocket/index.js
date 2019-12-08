// Modules
const Websocket = require('ws');
const EventEmitter = require('events');

// Static variables
const SWARM_URL = 'wss://swarm-dev.hiven.io/socket';
const ENCODING = 'json';

// WS Class
class WS extends EventEmitter {
  constructor(settings = { reconnectInt: 5000, reconnectCount: 5 }, cache = {}) {
    super();

    this.reconnectionCount = 0;
    this.settings = settings;
    this.cache = cache;
  }

  async sendOp(op, data) {
    if (this.ws.readyState != Websocket.OPEN) return false;
    if (op == 2) { this.cache.token = data.token; }
    if (data) return this.ws.send(JSON.stringify({ op, d: data }));
    return this.ws.send(JSON.stringify({ op }));
  }

  async startHeartbeat(int) {
    this.heartbeatInterval = setInterval(async () => this.sendOp(3), int);
  }

  async init() {
    return new Promise((resolve) => {
      this.ws = new Websocket(`${SWARM_URL}?encoding=${ENCODING}`);
  
      this.ws.on('open', async () => {
        this.reconnectionCount = 0;
        
        return resolve(true);
      });

      this.ws.on('close', async () => {
        // Websocket closed, stop the heartbeat ping and attempt reconnect using the settings from the client
        console.log(`Disconnected, waiting ${this.settings.reconnectInt}ms before reconnecting`);
        setTimeout(async () => {
          await this.ws.removeAllListeners();

          await this.reconnect();
          console.log('Reconnected!');
        }, this.settings.reconnectInt);
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

  async reconnect() {
    await this.init();

    // (TODO: THIS IS NOT THE PLACE FOR THIS) Login again using the cached credentials
    await this.sendOp(2, { token: this.cache.token });

    return true;
  }
}

module.exports = WS;