import { EventEmitter } from 'events';
import Websocket from 'ws';
import { RTCTransports } from './RTCTypes';

const RTC_URL = 'wss://us-east1-rtc-staging.hiven.io';

interface WSSettings {
  reconnectInt: number;
  reconnectCount: number;
}

export interface RTCCodec {
  kind: string;
  mimeType: string;
  clockRate: number;
  channels: number;
  rtcpFeedback: RtcpFeedback[];
  parameters: any;
  preferredPayloadType: number;
}

export interface RtcpFeedback {
  type: string;
  parameter: string;
}

export class Voice extends EventEmitter {
  private heartbeatInterval: NodeJS.Timeout | undefined;
  private reconnectionCount: number;
  private settings: WSSettings;
  private cache: any;
  private ws: Websocket | undefined;
  public RTCTransports?: RTCTransports;

  public headerExtensions?: string[];
  public codecs?: RTCCodec[];

  constructor(settings: WSSettings = { reconnectInt: 5000, reconnectCount: 5 }, cache = {}) {
    super();

    this.reconnectionCount = 0;
    this.settings = settings;
    this.cache = cache;
  }

  async sendOp(op: number, opts?: { e?: string; data?: any }): Promise<void> {
    if (this.ws?.readyState != Websocket.OPEN) return;
    if (op == 2) {
      this.cache.token = opts?.data.token;
    }
    if (opts?.data) return this.ws.send(JSON.stringify({ op, e: opts?.e, d: opts?.data }));
    return this.ws.send(JSON.stringify({ op, e: opts?.e }));
  }

  async startHeartbeat(int: number): Promise<void> {
    this.heartbeatInterval = setInterval(async () => this.sendOp(8), int);
  }

  destroy(): void {
    this.ws?.removeAllListeners();
    this.ws?.close();
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  async init(room_id: string, user_id: string, join_token: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.ws = new Websocket(`${RTC_URL}`);

      this.ws.on('open', async () => {
        this.reconnectionCount = 0;

        this.sendOp(0, {
          data: {
            room_id,
            user_id,
            join_token
          }
        });
        await this.startHeartbeat(20000);

        return resolve(true);
      });

      this.ws.on('close', async () => {
        // Websocket closed, stop the heartbeat ping and attempt reconnect using the settings from the client
        if (process.env.DEBUG) console.log(`Disconnected, waiting ${this.settings.reconnectInt}ms before reconnecting`);
        setTimeout(async () => {
          this.destroy();

          await this.reconnect();
        }, this.settings.reconnectInt);
      });

      this.ws.on('message', async (data: any) => {
        try {
          const body = JSON.parse(data);

          switch (body.op) {
            case 2:
              switch (body.e) {
                case 'ROUTER_RTP_CAPABILITIES':
                  this.codecs = body.d.codecs;
                  this.headerExtensions = body.d.headerExtensions;
                  break;
                case 'RTC_TRANSPORTS':
                  this.RTCTransports = body.d;

                  this.RTCTransports?.recv.dtlsParameters.fingerprints;

                  this.sendOp(1, {
                    e: 'SUBSCRIBE',
                    data: {
                      rtpCapabilities: {
                        codecs: this.codecs,
                        headerExtensions: this.headerExtensions
                      }
                    }
                  });

                  this.sendOp(1, {
                    e: 'TRANSPORT_DTLS_CONNECT',
                    data: {
                      id: this.RTCTransports?.recv.id,
                      dtlsParameters: {
                        role: 'client',
                        fingerprints: this.RTCTransports?.recv.dtlsParameters.fingerprints
                      }
                    }
                  });

                  this.sendOp(1, {
                    e: 'CONSUMER_CREATE',
                    data: {
                      transportId: this.RTCTransports?.send.id
                    }
                  });

                  this.emit('connection', this.RTCTransports);
                  break;

                default:
                  break;
              }
              //  ROUTER_RTP_CAPABILITIES
              break;

            default:
              break;
          }

          this.emit('data', body);
        } catch (error) {} /* eslint-disable-line no-empty */
      });
    });
  }

  async reconnect(): Promise<boolean> {
    await this.init(this.cache.room_id, this.cache.user_id, this.cache.join_token);

    // (TODO: THIS IS NOT THE PLACE FOR THIS) Login again using the cached credentials
    // await this.sendOp(2, { token: this.cache.token });

    return true;
  }
}
