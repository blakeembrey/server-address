/* global describe, it */
var expect = require('chai').expect
var http = require('http')
var https = require('https')
var request = require('request')
var join = require('path').join
var fs = require('fs')
var serverAddress = require('../')

describe('server address', function () {
  it('should return an object', function () {
    expect(serverAddress()).to.be.an('object')
  })

  it('should throw when retrieving a url and not listening', function () {
    expect(function () {
      serverAddress(handler).url('/foo')
    }).to.throw(/server is not listening/)
  })

  it('should resolve empty paths', function () {
    var server = serverAddress(handler)

    server.listen()
    expect(server.url()).to.match(/http:\/\/127\.0\.0\.1:\d+/)
    server.close()
  })

  it('should support functions', function (done) {
    var server = serverAddress(handler)

    server.listen()

    request(server.url('/foo'), function (err, res, body) {
      expect(body).to.equal('GET /foo')

      server.close()

      return done(err)
    })
  })

  it('should close immediately', function (done) {
    var server = serverAddress(handler)

    server.listen()

    var url1 = server.url('/foo')
    var url2 = server.url('/bar')

    request(url1, function (err, res, body) {
      expect(body).to.equal('GET /foo')

      server.close()

      /* istanbul ignore next */
      if (err) {
        return done(err)
      }

      return request(url2, function (err, res, body) {
        expect(err.code).to.equal('ECONNREFUSED')

        return done()
      })
    })
  })

  it('should support http servers', function (done) {
    var server = serverAddress(http.createServer(handler))

    server.listen()

    request(server.url('/foo'), function (err, res, body) {
      expect(body).to.equal('GET /foo')

      server.close()

      return done(err)
    })
  })

  it('should support https servers', function (done) {
    var server = serverAddress(https.createServer({
      key: fs.readFileSync(join(__dirname, 'fixtures/key.pem')),
      cert: fs.readFileSync(join(__dirname, 'fixtures/key-cert.pem'))
    }, handler))

    server.listen()

    request({
      url: server.url('/foo'),
      rejectUnauthorized: false
    }, function (err, res, body) {
      expect(body).to.equal('GET /foo')

      server.close()

      return done(err)
    })
  })

  it('should not listen or close an already listening server', function (done) {
    var app = http.createServer(handler).listen(0)
    var originalPort = app.address().port
    var server = serverAddress(app)

    expect(app.address().port).to.equal(originalPort)

    server.listen()

    expect(app.address().port).to.equal(originalPort)

    request(server.url('/foo'), function (err, res, body) {
      expect(body).to.equal('GET /foo')

      server.close()

      expect(app.address()).to.equal(null)

      return done(err)
    })
  })

  it('should support callback functions', function (done) {
    var server = serverAddress(http.createServer(handler))

    server.listen(function () {
      request(server.url('/foo'), function (err, res, body) {
        expect(body).to.equal('GET /foo')

        server.close(function () {
          return done(err)
        })
      })
    })
  })

  it('should support callback functions when already listening', function (done) {
    var server = serverAddress(http.createServer(handler).listen(0))

    server.listen(function () {
      request(server.url('/foo'), function (err, res, body) {
        expect(body).to.equal('GET /foo')

        server.close(function () {
          return done(err)
        })
      })
    })
  })
})

/**
 * Create a http request handler.
 */
function handler (req, res) {
  res.write(req.method + ' ' + req.url)
  res.end()
}
