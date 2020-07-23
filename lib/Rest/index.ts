// Modules
import axios, { AxiosRequestConfig } from 'axios'

// Types
import Request from '../Types/Request'
import Client from '../Client';

// Constants
const API_VERSION = 'v1';
const API_URL = `https://api.hiven.io/${API_VERSION}`;
const USER_AGENT = 'Hiven.js (Version 1.0.0) - https://github.com/hivenapp/hiven.js';

// Rest class
export default class Rest {

    private Client: Client;
    private token: string;
    private API_HEADERS: any;

    constructor(Client) {
     this.Client = Client;
    }

    async init(Client: any) {
        this.Client = Client;

        if (Client.options.ClientType === 'bot') this.token = `Bot ${Client.token}`
        else this.token = Client.token;

        this.API_HEADERS = {
            authorization: this.token,
            'user-agent': USER_AGENT
        }
    }

    async build({ method, path, data, headers }) {
        try {
            let request: Request = {
                url: `${API_URL}${path}`,
                headers: { ...headers, ...this.API_HEADERS },
                method
            };

            if (data) { request.data = data; request.headers['content-type'] = 'application/json'; }
            else request.headers['content-type'] = 'text/plain';

            let res = await axios(request as AxiosRequestConfig);

            return res;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async get(path, { data = {}, headers = {} } = {}) {
        return this.build({ method: 'GET', path, data, headers });
    }

    async post(path, { data = null, headers = {}}) {
        return this.build({ method: 'POST', path, data, headers });
    }

    async patch(path, { data, headers = {}}) {
        return this.build({ method: 'PATCH', path, data, headers });
    }

    async delete(path, { data = {}, headers = {} } = {}) {
        return this.build({ method: 'DELETE', path, data, headers });
    }
 }
