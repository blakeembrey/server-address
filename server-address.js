var http = require('http')
var https = require('https')
var resolve = require('url').resolve

/**
 * Export server address.
 */
module.exports = serverAddress

/**
 * Create a function that listens and closes server ports.
 *
 * @param  {Function} app
 * @return {Object}
 */
function serverAddress (app) {
  var server = typeof app === 'function' ? http.createServer(app) : app
  var protocol = app instanceof https.Server ? 'https' : 'http'
  var isListening = false
  var self = {}
  var connections = {}

  /**
   * Listen to a random port number.
   */
  function listen (cb) {
    if (!server.address()) {
      server.listen(0, cb)
    } else if (cb) {
      process.nextTick(cb)
    }

    if (!isListening) {
      isListening = true

      server.on('connection', function (c) {
        var key = c.remoteAddress + ':' + c.remotePort
        connections[key] = c
        c.on('close', function () {
          delete connections[key]
        })
      })
    }

    return self
  }

  /**
   * Resolve a url to the server location.
   *
   * @param  {String} path
   * @return {String}
   */
  function url (path) {
    var addr = server.address()

    if (!addr) {
      throw new Error('server is not listening, call the listen method first')
    }

    var origin = protocol + '://127.0.0.1:' + addr.port

    return resolve(origin, path || '/')
  }

  /**
   * Close the server (if listening).
   */
  function close (cb) {
    server.close(cb)

    for (var key in connections) {
      connections[key].destroy()
    }

    return self
  }

  // Expose methods externally.
  self.listen = listen
  self.url = url
  self.close = close

  return self
}
