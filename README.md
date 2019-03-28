# Game_New-test

Node.js. Configuration du proxy avec [[express](https://github.com/strongloop/express), [browser-sync](https://github.com/BrowserSync/browser-sync).

## TITRE

Proxy `/api` requests to `http://10.53.43.142:3333/`

```javascript
var express = require('express')
var proxy = require('Game_New-test')

var app = express()

app.use('/api', proxy({ target: 'http://10.53.43.142:3333/', changeOrigin: true }))
app.listen(3000)

// http://localhost:3000/ -> http://10.53.43.142:3333/
```


:bulb: **Tip:** 

## Table of Contents

<!-- MarkdownTOC autolink=true bracket=round depth=2 -->

- [Install](#install)
- [Options](#options)
  - [Game_New-test options](#Game_New-test-options)
  - [http-proxy events](#http-proxy-events)
  - [http-proxy options](#http-proxy-options)
- [WebSocket](#websocket)
  - [External WebSocket upgrade](#external-websocket-upgrade)
- [Changelog](#changelog)
- [License](#license)

<!-- /MarkdownTOC -->

## Install

```javascript
$ npm install --
```

## Concept du Projet


- **contexte**:
- **options**: 

## Example

N°1

```javascript
exemple code
```


## WebSocket

```javascript
// verbose api
proxy('/', { target: 'http://echo.websocket.org', ws: true })

// shorthand
proxy('http://echo.websocket.org', { ws: true })

// shorter shorthand
proxy('ws://echo.websocket.org')
```

### External WebSocket upgrade

In the previous WebSocket examples, Game_New-test relies on a initial http request in order to listen to the http `upgrade` event. If you need to proxy WebSockets without the initial http request, you can subscribe to the server's http `upgrade` event manually.

```javascript
var wsProxy = proxy('ws://echo.websocket.org', { changeOrigin: true })

var app = express()
app.use(wsProxy)

var server = app.listen(3000)
server.on('upgrade', wsProxy.upgrade) // <-- subscribe to http 'upgrade'
```

## Tests

Run the test suite:

```bash
# install dependencies
$ npm install

# linting
$ npm run lint

# unit tests
$ npm test

# code coverage
$ npm run cover
```

## Changelog

- [View changelog](https://github.com/rikku28/Game_New-test/master/CHANGELOG.md)

## License

The MIT License (MIT)

Copyright (c) 2019 Amelie
