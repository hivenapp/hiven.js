# Hiven.js

Client library for Hiven, used to make chat bots and interact with the API.

This library is extremely unfinished currently it only handles incoming events from the gateway.

This was originally created to be similar to discord.js and will probably still inherit some of it's features in the future.

IMPORTANT: In order to use this library with a user account you need to instantiate your client with these settings.

```js
const Hiven = require('hiven.js');
const Client = new Hiven.Client({ clientType: 'user' });
```
