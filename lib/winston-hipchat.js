'use strict';

var util = require('util')
, winston = require('winston')
, request = require('request')
, Stream = require('stream').Stream
, _ = require('lodash')

//
// ### function Hipchat (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Hipchat transport object responsible
// for persisting log messages and metadata to a terminal or TTY.
//
var Hipchat = exports.Hipchat = function (options) {
  winston.Transport.call(this, options)

  if (!options.room) throw new Error('Must have a room option set.')
  if (!options.token) throw new Error('Must have a token option set.')

  this.name = 'Hipchat'
  this.options = _.defaults(options || {}, {
  from: 'winston'
  , notify: 0
  , color: 'yellow'
  , messageFormat: 'text'
  })
}

util.inherits(Hipchat, winston.Transport)

//
// Expose the name of this Transport on the prototype
//
Hipchat.prototype.name = 'Hipchat'

//
// ### function _request (options, callback)
// #### @callback {function} Continuation to respond to when complete.
// Make a request to a winstond server or any http server which can
// handle json-rpc.
//
Hipchat.prototype._request = function (options, callback) {
  options = options || {}

  options.method = 'POST'
  options.params.meta = Object.keys(options.params.meta).length ? JSON.stringify(options.params.meta, null, 2) : ''
  options.qs = {
    'room_id': this.options.room
  , from: this.options.from
  , 'auth_token': this.options.token
  , notify: this.options.notify ? 1 : 0
  , color: this.options.color
  , 'message_format': this.options.messageFormat
  , message: this.options.message ? _.template(this.options.message, options.params, {
    interpolate: /\{\{(.*?)\}\}/g
  }) : options.params.message + (options.params.meta ? '\n\n' + options.params.meta : '')
  }
  options.url = 'https://api.hipchat.com/v1/rooms/message'

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
