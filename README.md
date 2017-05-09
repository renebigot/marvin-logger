# marvin-logger

![npm](https://img.shields.io/npm/v/marvin-logger.svg) ![license](https://img.shields.io/npm/l/marvin-logger.svg) ![github-issues](https://img.shields.io/github/issues/renebigot/marvin-logger.svg) ![travis-status](https://img.shields.io/travis/renebigot/marvin-logger.svg)

Simple, effective, colorful and cross-platform logger for nodejs

![nodei.co](https://nodei.co/npm/marvin-logger.png?downloads=true&downloadRank=true&stars=true)

![stars](https://img.shields.io/github/stars/renebigot/marvin-logger.svg)
![forks](https://img.shields.io/github/forks/renebigot/marvin-logger.svg)
![forks](https://img.shields.io/github/forks/renebigot/marvin-logger.svg)

![](https://david-dm.org/renebigot/marvin-logger/status.svg)
![](https://david-dm.org/renebigot/marvin-logger/dev-status.svg)

## Features

![screenshot macOS](https://raw.githubusercontent.com/renebigot/marvin-logger/master/img/mac.png)

`marvin-logger` is a simple, effective, colorful and cross-platform logger for nodejs which:

* Log to console
* Log to file
* Works as a middleware with expressjs
* "Rotate" log files
* Colorize logs by levels (debug, info, warning, error, important, http)


## Install

`npm install --save marvin-logger`


## Usage

Include library and create a logger instance. By default, you'll log only to your console.

```javascript
var Marvin = require('marvin-logger'),
    logger = new Marvin();
```

To log to file, you have to define the output directory:

```javascript
var Marvin = require('marvin-logger'),
    logger = new Marvin({
      logOutputDirectory: './logs'
    });
```


Default log format is `{{DATETIME}} {{PID}} {{LOG}}` with :
* {{DATETIME}} : Date + time (for file log) or time (for console log)
* {{PID}} : Current process PID (useful for clusters)
* {{LOG}} : Log message

Log format can be specified at init time :

```javascript
var Marvin = require('marvin-logger'),
    logger = new Marvin({
      logFormat: '{{DATETIME}} - {{LOG}}'
      logOutputDirectory: './logs'
    });
```

Log some debug data : 

```javascript
logger.debug('[debug] message');
logger.debug('Another debug message with object', {foo: 'bar'});
```

`debug()` can be replaced with `info()`, `warn()`, `error()`, `important()` and `http()`. Every methods use the same syntax as `console.log()`.

You can define a minimal log level by passing the `level` option to Marvin:

```javascript
var Marvin = require('marvin-logger'),
    logger = new Marvin({
      level: 'error',
      logOutputDirectory: './logs'
    });
```

In this example, only `error()`, `important()` and `http()` will be able to display information.

`important()` and `http()` are always shown. You can use them to display important data like critical states or http access (or what ever you want).

To change log level : 

```javascript
logger.setLogLevel('info'); // level >= INFO
logger.setLogLevel('none'); // only HTTP & IMPORTANT
```

If the log data begins with brackets ('[...]'), only the text between the brackets will be colorized.

```javascript
logger.important('[MyApp] Super important log message'); // Only 'MyApp' will be shown in magenta  
```

To use `marvin-logger` as an expressjs middleware logger:

```javascript
var express = require('express'),
    app = express(),
    logger = new Marvin();

app.use(logger.expressMiddleWare());
```

To filter, you can specify wich string or Regex your messages should match, one filter per log level:

```javascript
var Marvin = require('marvin-logger'),
    logger = new Marvin({
      errorFilter: 'my-filter-string',
      debugFilter: 'my-filter-regex',
    });
```

Available filters are : `debugFilter`, `infoFilter`, `warnFilter`, `errorFilter`, `importantFilter` and `httpFilter`.

Messages not matching filters are neither written to console nor file.

To change a filter after init : 

```javascript
logger.setDebugFilter(null);
logger.setInfoFilter('my-string');
logger.setWarnFilter('my-string');
logger.setErrorFilter('');
logger.setImportantFilter(/my-[regx]/i);
logger.setHttpFilter(/[^htp]/i);
```

To use ```marvin-logger``` as a singleton insance : 

```javascript
var logger = require('marvin-logger').sharedInstance;
logger.setLogOutputDirectory('logs');
logger.setLogLevel('debug');
```

## Scripts

 - **npm run test** : `mocha`
 - **npm run autotest** : `supervisor -q -n exit -x mocha -- --reporter=nyan`
 - **npm run autotest-cov** : `supervisor -w ./index.js,./test -q -n exit -x istanbul -- cover _mocha`
 - **npm run readme** : `node ./node_modules/.bin/node-readme`

## Dependencies

Package | Version | Dev
--- |:---:|:---:
[colors](https://www.npmjs.com/package/colors) | ^1.1.2 | ✖
[file-stream-rotator](https://www.npmjs.com/package/file-stream-rotator) | 0.0.7 | ✖
[on-finished](https://www.npmjs.com/package/on-finished) | ^2.3.0 | ✖
[on-headers](https://www.npmjs.com/package/on-headers) | ^1.0.1 | ✖
[express](https://www.npmjs.com/package/express) | ^4.14.0 | ✔
[istanbul](https://www.npmjs.com/package/istanbul) | ^0.4.5 | ✔
[mocha](https://www.npmjs.com/package/mocha) | ^3.2.0 | ✔
[node-readme](https://www.npmjs.com/package/node-readme) | ^0.1.9 | ✔
[supertest](https://www.npmjs.com/package/supertest) | ^2.0.1 | ✔
[supervisor](https://www.npmjs.com/package/supervisor) | ^0.12.0 | ✔


## Contributing

Contributions welcome; Please submit all pull requests against the master branch. If your pull request contains JavaScript patches or features, you should include relevant unit tests.

## Author

René BIGOT

## License

 - **MIT** : http://opensource.org/licenses/MIT
