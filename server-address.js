var http = require('http')
var https = require('https')
var resolve = require('url').resolve
var enableDestroy = require('server-destroy')

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
  // Support functions (Express, Connect, etc).
  if (typeof app === 'function') {
    app = http.createServer(app)
  }

  var server
  var protocol = app instanceof https.Server ? 'https' : 'http'
  var self = {}

  /**
   * Listen to a random port number.
   */
  function listen (cb) {
    if (!app.address()) {
      server = app.listen(0, cb)

      enableDestroy(server)
    } else if (cb) {
      process.nextTick(cb)
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
    var addr = app.address()

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
    if (server) {
      server.destroy(cb)
    } else if (cb) {
      process.nextTick(cb)
    }

    return self
  }

  // Expose methods externally.
  self.listen = listen
  self.url = url
  self.close = close

  return self
}
