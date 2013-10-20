# winston-hipchat

[![NPM](https://nodei.co/npm/winston-hipchat.png)](https://nodei.co/npm/winston-hipchat/)

A [Hipchat][0] transport for [winston][1].

## Usage
``` js
  var winston = require('winston')
    , winstonHipchat = require('winston-hipchat').Hipchat

  winston.add(winstonHipchat, options)
```

Many options can be seen in the [Hipchat API docs](https://www.hipchat.com/docs/api/method/rooms/message).

* __level:__ Level of messages that this transport should log.
* __silent:__ If true, will not log messages.
* __token:__ [Hipchat authtoken](https://uwn-test.hipchat.com/admin/api). Only needs to be the "notification" type.
* __notify:__ If true, will notify the hipchat room.
* __color:__ One of "yellow", "red", "green", "purple", "gray", or "random". (default: yellow)
* __room:__ Required. ID or name of the room.
* __from:__ Required. Name the message will appear be sent from. Must be less than 15 characters long. May contain letters, numbers, -, _, and spaces.
* __messageFormat:__ `text` (default) or `html`.
* __message:__ [lodash templates](http://lodash.com/docs#template). Gets passed the `{{message}}`, `{{level}}`, and `{{meta}}` as a JSON string. If not specified, it will print a default of `{{message}}\n\n{{meta}}`

## Installation

### Installing npm (node package manager)

``` bash
  $ curl http://npmjs.org/install.sh | sh
```

### Installing winston-hipchat

``` bash
  $ npm install winston
  $ npm install winston-hipchat
```

## Run Tests
None yet.

## Changelog
### 0.1.0 Initial Release

#### Author: [Joey Baker](http://byjoeybaker.com)
Based on [winston-loggly](https://github.com/indexzero/winston-loggly) by [Charlie Robbins](http://blog.nodejitsu.com)
#### License: MIT

[0]: http://hipchat.com
[1]: https://github.com/flatiron/winston
[2]: http://nodejitsu.com
[6]: http://vowsjs.org
[7]: http://npmjs.org
