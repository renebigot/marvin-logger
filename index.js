const fs = require('fs'),
      path = require('path'),
      FileStreamRotator = require('file-stream-rotator'),
      colors = require('colors/safe'),
      DEBUG = 0,
      INFO = 1,
      WARN = 2,
      ERROR = 3,
      NONE = 4;

class Marvin {
  constructor(opts) {
    /*
    Defaults :
    level: debug        // Minimal level to log
    logOutputDirectory: undefined        // Log output directory
    consoleCallback: undefined        // console.log substitution
    fileCallback: undefined        // file logger substitution
    */

    opts = opts || {};
    this.setLogLevel(opts.level || 'debug');
    this._logOutputDirectory = opts.logOutputDirectory ? path.resolve(opts.logOutputDirectory) : false;

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

  setLogLevel(level) {
    this._level = this._levelValue(level);
  }

  debug() {
    if (this._level > DEBUG) {
      return false;
    }

    return this._writeLog(arguments, colors.debug);
  }

  info() {
    if (this._level > INFO) {
      return false;
    }

    return this._writeLog(arguments, colors.info);
  }

  warn() {
    if (this._level > WARN) {
      return false;
    }

    return this._writeLog(arguments, colors.warn);
  }

  error() {
    if (this._level > ERROR) {
      return false;
    }

    return this._writeLog(arguments, colors.error);
  }

  important() {
    return this._writeLog(arguments, colors.important);
  }

  http() {
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
          filename: path.resolve(this._logOutputDirectory, './PID_' + process.pid + '-%DATE%.log'),
          frequency: 'daily',
          verbose: false
        });
      }

      this._logStream.write(data);
    }
  }

  _writeLog(args, color) {
    var data = '';
    Object.keys(args).forEach(argi => {
      var tmpData = args[argi];

      if (typeof tmpData === 'object') {
        tmpData = JSON.stringify(tmpData, null, 2);
      }

      data += tmpData + ' ';
    });

    if (data.length > 0) {
      data = data.substr(0, data.length - 1);
    }

    // Log to console
    this._consoleCallback(this._formattedTimeForLogging(new Date()),
                          this._coloredPid(),
                          this._coloredString(data, color));

    // Log to file
    this._fileCallback(this._formattedDateForLogging(new Date()) +
                       ' ' + this._pid() + ' ' + data + '\n');

    return true;
  }
}

module.exports = Marvin;
