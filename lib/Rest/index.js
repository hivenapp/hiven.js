// Modules
const axios = require('axios');

const API_VERSION = 'v1';
const API_URL = `https://api.hiven.io/${API_VERSION}`;
const USER_AGENT = 'Hiven.js (Version 1.0.0) - by: @dustinrouillard - https://github.com/hivenapp/hiven.js';

// Rest class
class Rest {
    constructor() {
    
    }

    async init(Client) {
        this.Client = Client;

        if (Client.options.ClientType === 'bot') this.token = `Bot ${Client.token}`
        else this.token = Client.token;

        this.API_HEADERS = {
            authorization: this.token,
            'content-type': 'application/json',
            'user-agent': USER_AGENT
        }
    }

    async build({ method, path, data, headers }) {
        try {
            let finalHeaders = { ...headers, ...this.API_HEADERS };
            let request = {
                url: `${API_URL}${path}`,
                headers: finalHeaders,
                method
            };

            if (data) request.data = data;
            else request.data = {};

            let res = await axios(request);

            return res;
        } catch (error) {
            console.error(error);
        }
    }

    async get(path, { headers } = {}) {
        return this.build({ method: 'GET', path, headers });
    }

    async post(path, { data, headers } = {}) {
        return this.build({ method: 'POST', path, data, headers });
    }

    async patch(path, { data, headers } = {}) {
        return this.build({ method: 'PATCH', path, data, headers });
    }

    async delete(path, { data, headers } = {}) {
        return this.build({ method: 'DELETE', path, data, headers });
    }
 }

module.exports = Rest;