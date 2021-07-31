// Modules
import { EventEmitter } from 'events';
import Websocket from 'ws';

// Static variables
const SWARM_URL = 'wss://swarm.hiven.io/socket?encoding=json&compression=text_json';
const ENCODING = 'json';

interface WSSettings {
  reconnectInt: number;
  reconnectCount: number;
}

// WS Class
export class WS extends EventEmitter {
  private heartbeatInterval: NodeJS.Timeout | undefined;
  private reconnectionCount: number;
  private settings: WSSettings;
  private cache: any;
  private ws: Websocket | undefined;

  constructor(settings: WSSettings = { reconnectInt: 5000, reconnectCount: 5 }, cache = {}) {
    super();

    this.reconnectionCount = 0;
    this.settings = settings;
    this.cache = cache;
  }

  async sendOp(op: number, data?: any) {
    if (this.ws?.readyState != Websocket.OPEN) return false;
    if (op == 2) {
      this.cache.token = data.token;
    }
    if (data) return this.ws.send(JSON.stringify({ op, d: data }));
    return this.ws.send(JSON.stringify({ op }));
  }

  async startHeartbeat(int: number) {
    this.heartbeatInterval = setInterval(async () => this.sendOp(3), int);
  }

  async destroy() {
    await this.ws?.removeAllListeners();
    await this.ws?.close();
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
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
        if (process.env.DEBUG) console.log(`Disconnected, waiting ${this.settings.reconnectInt}ms before reconnecting`);
        setTimeout(async () => {
          await this.ws?.removeAllListeners();

          await this.reconnect();
        }, this.settings.reconnectInt);
      });

      this.ws.on('message', async (data: any) => {
        try {
          const body = JSON.parse(data);

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
