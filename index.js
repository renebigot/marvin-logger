require('node-json-color-stringify');

const fs = require('fs'),
      path = require('path'),
      onFinished = require('on-finished'),
      onHeaders = require('on-headers'),
      FileStreamRotator = require('file-stream-rotator'),
      colors = require('colors/safe'),
      DEBUG = 0,
      INFO = 1,
      WARN = 2,
      ERROR = 3,
      NONE = 4;

class Marvin {
  static get sharedInstance() {
    if (this._sharedInstance === undefined) {
      this._sharedInstance = new this();
    }
    return this._sharedInstance;
  }
  static set sharedInstance(value) {/* No setter, singleton */}

  constructor(opts) {
    opts = opts || {};
    this.setLogLevel(opts.level || 'debug');

    this.setDebugFilter(opts.debugFilter || null);
    this.setInfoFilter(opts.infoFilter || null);
    this.setWarnFilter(opts.warnFilter || null);
    this.setErrorFilter(opts.errorFilter || null);
    this.setHttpFilter(opts.httpFilter || null);
    this.setImportantFilter(opts.importantFilter || null);
    this.setLogOutputDirectory(opts.logOutputDirectory);

    this._logFormat = opts.logFormat || '{{DATETIME}} {{PID}} {{LOG}}';

    this._consoleCallback = opts.consoleCallback || console.log;
    this._fileCallback = opts.fileCallback || this._fileLog;

    // Colors theme for output
    colors.setTheme({
      pid: 'magenta',
      datetime: 'grey',
      data: 'black',
      debug: 'blue',
      info: 'green',
      warn: 'yellow',
      error: 'red',
      important: 'magenta',
      http: 'cyan'
    });

  }

  expressMiddleWare() {
    var that = this;
    return function logger(req, res, next) {
      // request data
      req._startAt = undefined;
      req._startTime = undefined;
      req._remoteAddress = that._getip(req);

      // response data
      res._startAt = undefined;
      res._startTime = undefined;

      // record request start
      that._recordStartTime.call(req);

      // record response start
      onHeaders(res, that._recordStartTime);

      // log when response finished
      function _logRequest() {
        var responseTime = (req._startAt && res._startAt)
        ? ((res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6).toFixed(2)
        : 0,
            url = req.originalUrl || req.url,
            status = res._header ? String(res.statusCode) : undefined;

        var line = '[' + req.method + '] ' + url + ' (' + responseTime + ' ms) ' + status + ' ' + that._getip(req);
        that.http(line)
      };

      onFinished(res, _logRequest);

      next();
    }
  }

  setLogOutputDirectory(logOutputDirectory) {
    this._logOutputDirectory = logOutputDirectory ? path.resolve(logOutputDirectory) : false;
  }

  setLogLevel(level) {
    this._level = this._levelValue(level);
  }

  setDebugFilter(filter) {
    this._debugFilter = filter;
  }

  setInfoFilter(filter) {
    this._infoFilter = filter;
  }

  setWarnFilter(filter) {
    this._warnFilter = filter;
  }

  setErrorFilter(filter) {
    this._errorFilter = filter;
  }

  setHttpFilter(filter) {
    this._httpFilter = filter;
  }

  setImportantFilter(filter) {
    this._importantFilter = filter;
  }

  debug() {
    if (this._level > DEBUG || this._isExcludedByFilter(this._debugFilter, arguments)) {
      return false;
    }

    return this._writeLog(arguments, colors.debug);
  }

  info() {
    if (this._level > INFO || this._isExcludedByFilter(this._infoFilter, arguments)) {
      return false;
    }

    return this._writeLog(arguments, colors.info);
  }

  warn() {
    if (this._level > WARN || this._isExcludedByFilter(this._warnFilter, arguments)) {
      return false;
    }

    return this._writeLog(arguments, colors.warn);
  }

  error() {
    if (this._level > ERROR || this._isExcludedByFilter(this._errorFilter, arguments)) {
      return false;
    }

    return this._writeLog(arguments, colors.error);
  }

  important() {
    if (this._isExcludedByFilter(this._importantFilter, arguments)) {
      return false;
    }

    return this._writeLog(arguments, colors.important);
  }

  http() {
    if (this._isExcludedByFilter(this._httpFilter, arguments)) {
      return false;
    }

    return this._writeLog(arguments, colors.http);
  }

  _levelValue(level) {
    switch(level.charAt(0).toUpperCase()) {
      case 'N':
        return NONE;

      case 'E':
        return ERROR;

      case 'W':
        return WARN;

      case 'I':
        return INFO;

      default:
        return DEBUG;
    }
  }

  _isExcludedByFilter(filter, args) {
    var data = this._argumentsToString(args);

    if (!filter) {
      // if no filter set, data is not excluded
      return false;

    } else if (typeof filter === 'string') {
      // If data do not contain filter, exclude
      return data.indexOf(filter) < 0;

    }

    // If data match filter, do not exclude
    return !filter.test(data);
  }

  /* Convert date to YYYY/MM/DD hh:mm:ss */
  _formattedDateForLogging(date) {
    return date.getFullYear() +
      "/" +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      "/" +
      ('0' + date.getDate()).slice(-2) +
      " " +
      ('0' + date.getHours()).slice(-2) +
      ':' +
      ('0' + date.getMinutes()).slice(-2) +
      ':' +
      ('0' + date.getSeconds()).slice(-2);
  }

  /* Convert date to hh:mm:ss with 'datetime' color */
  _formattedTimeForLogging(date) {
    return colors.datetime(
      ('0' + date.getHours()).slice(-2) +
      ':' +
      ('0' + date.getMinutes()).slice(-2) +
      ':' +
      ('0' + date.getSeconds()).slice(-2));
  }

  _pid() {
    return 'PID_' + process.pid;
  }

  _coloredPid() {
    return colors.pid(this._pid());
  }

  _coloredString(str, color) {
    var splitted;

    if (str.charAt(0) === '[') {
      splitted = str.split(']');

      if (splitted.length > 1) {
        splitted[0] = '[' + color(splitted[0].replace('[', ''));
      }
    } else {
      splitted = [color(str)];
    }

    return splitted.join(']');
  }

  _fileLog(data) {
    if (this._logOutputDirectory) {
      if (!this._logStream) {
        // Create log directory if doesn't exist
        try {
          fs.mkdirSync(this._logOutputDirectory);
        } catch(e) {
          if ( e.code != 'EEXIST' ) {
            throw e;
          }
        }

        // Create log stream
        this._logStream = FileStreamRotator.getStream({
          date_format: 'YYYY-MM-DD',
          filename: path.resolve(this._logOutputDirectory, './%DATE%.log'),
          frequency: 'daily',
          verbose: false
        });
      }

      this._logStream.write(data);
    }
  }

  _writeLog(args, color) {
    var log = '' + this._logFormat;

    // Log to console
    this._consoleCallback(log.replace('{{DATETIME}}', this._formattedTimeForLogging(new Date()))
                          .replace('{{PID}}', this._coloredPid())
                          .replace('{{LOG}}', this._coloredString(this._argumentsToString(args, true), color)));

    // Log to file
    this._fileCallback(log.replace('{{DATETIME}}', this._formattedDateForLogging(new Date()))
                       .replace('{{PID}}', this._pid())
                       .replace('{{LOG}}', this._argumentsToString(args, false))
                       + '\n');

    return true;
  }

  _argumentsToString(args, color) {
    var data = '';

    Object.keys(args).forEach(argi => {
      var tmpData = args[argi];

      if (typeof tmpData === 'object') {
        if (color) {
          tmpData = JSON.colorStringify(tmpData, null, 2);
        } else {
          tmpData = JSON.stringify(tmpData, null, 2);
        }
      }

      data += tmpData + ' ';
    });

    if (data.length > 0) {
      data = data.substr(0, data.length - 1);
    }

    return data;
  }

  _recordStartTime() {
    this._startAt = process.hrtime()
    this._startTime = new Date()
  }

  _getip(req) {
    return req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || undefined;
  }

}

module.exports = Marvin;
