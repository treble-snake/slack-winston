# slack-winston

[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-downloads]][npm-url]
[![MIT License][license-image]][license-url]

> A [Slack][slack] transport for [winston][winston].

> **NOTE**: This package was created because `winston-slack` did not have similar code
structure to `winston-hipchat` (switched from using HipChat &rarr; Slack and wanted consistency).


## Index

* [Install](#install)
* [Usage](#usage)
* [Credits](#credits)
* [License](#license)


## Install

```bash
npm install -S winston winston-slack
```


## Usage

```js
var winston = require('winston')
var slackWinston = require('slack-winston').Slack

var options = {
  level: 'warn',
  token: 'my-slack-token',
  channel: 'general',

}

winston.add(slackWinston, options)
```

Many options can be seen in the [Slack API docs](https://api.slack.com/methods/chat.postMessage).

* __level:__ Level of messages that this transport should log
* __silent:__ If true, will not log messages
* __token:__ Required. Slack incoming webhook token
* __channel:__ Required. Channel of chat (e.g. "#foo" or "foo")
* __domain:__ Required. Domain of Slack (e.g. "foo" if "foo.slack.com")
* __username:__ Username of the incoming webhook Slack bot (defaults to "Winston")
* __icon_emoji:__ Icon of bot (defaults to :tophat: `:tophat:`)
* __message:__ [lodash templates](http://lodash.com/docs#template). Gets passed the `{{message}}`, `{{level}}`, and `{{meta}}` as a JSON string. If not specified, it will print a default of `{{message}}\n\n{{meta}}`.  **Note that this gets sent as the `text` field in the payload per Slack requirements.**


## Credits

* Based on [winston-hipchat](https://github.com/joeybaker/winston-hipchat) by [Joey Baker](https://github.com/joeybaker)
* Based on [winston-loggly](https://github.com/indexzero/winston-loggly) by [Charlie Robbins](http://blog.nodejitsu.com)


## License

[MIT][license-url]


[license-url]: LICENSE
[slack]: http://slack.com
[winston]: https://github.com/flatiron/winston
[npm-image]: http://img.shields.io/npm/v/slack-winston.svg?style=flat
[npm-url]: https://npmjs.org/package/slack-winston
[npm-downloads]: http://img.shields.io/npm/dm/slack-winston.svg?style=flat
