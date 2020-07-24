// Modules
import fetch, { HeadersInit } from 'node-fetch';

// Types
import { Client } from '../Client';

// Constants
const API_VERSION = 'v1';
const API_URL = `https://api.hiven.io/${API_VERSION}`;
const USER_AGENT = 'Hiven.js (Version 1.0.0) - https://github.com/hivenapp/hiven.js';

interface RestBuild {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  path: string;
  data: any;
  headers: HeadersInit;
}

// Rest class
export default class Rest {
  private client: Client;
  private token?: string;
  private API_HEADERS: any;

  constructor(client: Client) {
    this.client = client;
  }

  async init(client: Client) {
    this.client = client;

    if (this.client.options.type === 'bot') this.token = `Bot ${client.token}`;
    else this.token = client.token;

    this.API_HEADERS = {
      authorization: this.token,
      'user-agent': USER_AGENT
    };
  }

  async build<T = any>({ method, path, data, headers }: RestBuild): Promise<T> {
    try {
      let url = `${API_URL}${path}`;

      headers = { 'content-type': 'text/plain' };

      if (data) {
        data = JSON.stringify(data);
        headers['content-type'] = 'application/json';
      } else headers['content-type'] = '';

      let res = await fetch(url, {
        method,
        body: data,
        headers: { ...headers, ...this.API_HEADERS }
      });

      let body;
      if (res.headers.get('content-type')?.includes('application/json')) body = await res.json();
      else body = await res.text();

      return body;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async get<T = any>(path: string, { data = {}, headers = {} } = {}): Promise<T> {
    return await this.build<T>({ method: 'get', path, data, headers });
  }

  async post<T = any>(path: string, { data = {}, headers = {} }): Promise<T> {
    return await this.build<T>({ method: 'post', path, data, headers });
  }

  async patch<T = any>(path: string, { data = {}, headers = {} }): Promise<T> {
    return await this.build<T>({ method: 'patch', path, data, headers });
  }

  async delete<T = any>(path: string, { data = {}, headers = {} } = {}): Promise<T> {
    return await this.build<T>({ method: 'delete', path, data, headers });
  }
}
