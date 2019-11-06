# Server Address

[![NPM version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Listen to a randomly available port and resolve URLs relative to the server address.

## Installation

```
npm install server-address --save
```

## Usage

```js
import { ServerAddress } from "server-address";
import * as express from "express";

const app = express();
const server = new ServerAddress(app);

// Listen to randomly available port.
server.listen();

server.url("/foo"); //=> "http://127.0.0.1:58933/foo"

// Close the server connection.
server.close();
```

**Note:** `listen` and `close` can optionally accept callback functions.

## License

MIT license

[npm-image]: https://img.shields.io/npm/v/server-address.svg?style=flat
[npm-url]: https://npmjs.org/package/server-address
[travis-image]: https://img.shields.io/travis/blakeembrey/server-address.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/server-address
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/server-address.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/server-address?branch=master
[downloads-image]: https://img.shields.io/npm/dm/server-address.svg?style=flat
[downloads-url]: https://npmjs.org/package/server-address
