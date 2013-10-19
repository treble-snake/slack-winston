'use strict';

var util = require('util'),
    winston = require('winston'),
    request = require('request'),
    Stream = require('stream').Stream

//
// ### function Hipchat (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Hipchat transport object responsible
// for persisting log messages and metadata to a terminal or TTY.
//
var Hipchat = exports.Hipchat = function (options) {
  winston.Transport.call(this, options)

  options = options || {}

  if (!options.room) throw new Error('Must have a room option set.')
  if (!options.token) throw new Error('Must have a token option set.')

  this.name = 'http'
  this.ssl = true
  this.host = 'api.hipchat.com'
  this.port = 443
  this.silent = options.silent
  this.token = options.token
  this.room = options.room
  this.from = options.from || 'winston'
  this.notify = options.notify ? 1 : 0
  this.color = options.color || 'yellow'
  this.path = '/v1/rooms/message'
}

util.inherits(Hipchat, winston.Transport)

//
// Expose the name of this Transport on the prototype
//
Hipchat.prototype.name = 'http'

//
// ### function _request (options, callback)
// #### @callback {function} Continuation to respond to when complete.
// Make a request to a winstond server or any http server which can
// handle json-rpc.
//
Hipchat.prototype._request = function (options, callback) {
  var auth

  options = options || {}

  options.method = 'POST'
  options.qs = {
    'room_id': this.room
  , from: this.from
  , 'auth_token': this.token
  , notify: this.notify
  , color: this.color
  , 'message_format': 'text'
  , message: options.params.message + (Object.keys(options.params.meta).length? '\n\n' + JSON.stringify(options.params.meta) : '')
  }
  options.url = 'http'
    + (this.ssl ? 's' : '')
    + '://'
    + (auth ? auth.username + ':' : '')
    + (auth ? auth.password + '@' : '')
    + this.host
    + ':'
    + this.port
    + this.path

  return request(options, callback)
}

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
Hipchat.prototype.log = function (level, msg, meta, callback) {
  var self = this

  if (this.silent) return callback(null, true)

  if (typeof meta === 'function') {
    callback = meta
    meta = {}
  }

  var options = {
    method: 'collect'
  , params: {
      message: msg
    , meta: meta
    , level: level
    }
  }

  this._request(options, function (err, res) {
    if (res && res.statusCode !== 200) {
      err = new Error('winston: hipchat: HTTP Status Code: ' + res.statusCode)
    }

    if (err) return callback(err)

    // TODO: emit 'logged' correctly,
    // keep track of pending logs.
    self.emit('logged')

    if (callback) callback(null, true)
  })
}

//
// ### function query (options, callback)
// #### @options {Object} Loggly-like query options for this instance.
// #### @callback {function} Continuation to respond to when complete.
// Query the transport. Options object is optional.
//
Hipchat.prototype.query = function (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  options = this.normalizeQuery(options)

  options = {
    method: 'query',
    params: options
  }

  this._request(options, function (err, res, body) {
    if (res && res.statusCode !== 200) {
      err = new Error('HTTP Status Code: ' + res.statusCode)
    }

    if (err) return callback(err)

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch (e) {
        return callback(e)
      }
    }

    callback(null, body)
  })
}

//
// ### function stream (options)
// #### @options {Object} Stream options for this instance.
// Returns a log stream for this transport. Options object is optional.
//
Hipchat.prototype.stream = function (options) {
  var stream = new Stream(),
      req,
      buff

  options = options || {}

  stream.destroy = function () {
    req.destroy()
  }

  options = {
    method: 'stream',
    params: options
  }

  if (options.params.path) {
    options.path = options.params.path
    delete options.params.path
  }

  if (options.params.auth) {
    options.auth = options.params.auth
    delete options.params.auth
  }

  req = this._request(options)
  buff = ''

  req.on('data', function (data) {
    var l, i

    data = (buff + data).split(/\n+/),
    l = data.length - 1,
    i = 0

    for (; i < l; i++) {
      try {
        stream.emit('log', JSON.parse(data[i]))
      } catch (e) {
        stream.emit('error', e)
      }
    }

    buff = data[l]
  })

  req.on('error', function (err) {
    stream.emit('error', err)
  })

  return stream
}
