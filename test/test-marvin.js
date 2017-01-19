const fs = require('fs'),
      assert = require('assert'),
      request = require('supertest'),
      Marvin = require('../index.js');

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

describe('Instance creation', function() {

  it('should create marvin instance', done => {
    var logger = new Marvin();
    assert.ok(logger);
    done();
  });

  it('should set minimal level to DEBUG', done => {
    const DEBUG = 0;

    var logger = new Marvin({level: 'Debug'});
    assert.equal(logger._level, DEBUG);

    logger = new Marvin({level: 'd'});
    assert.equal(logger._level, DEBUG);

    logger = new Marvin({level: '#'});
    assert.equal(logger._level, DEBUG);

    logger = new Marvin({});
    assert.equal(logger._level, DEBUG);

    done();
  });

  it('should set minimal level to INFO', done => {
    const INFO = 1;

    var logger = new Marvin({level: 'Info'});
    assert.equal(logger._level, INFO);

    logger = new Marvin({level: 'i'});
    assert.equal(logger._level, INFO);

    done();
  });

  it('should set minimal level to WARN', done => {
    const WARN = 2;

    var logger = new Marvin({level: 'Warning'});
    assert.equal(logger._level, WARN);

    logger = new Marvin({level: 'w'});
    assert.equal(logger._level, WARN);

    done();
  });

  it('should set minimal level to ERROR', done => {
    const ERROR = 3;

    var logger = new Marvin({level: 'Error'});
    assert.equal(logger._level, ERROR);

    logger = new Marvin({level: 'e'});
    assert.equal(logger._level, ERROR);

    done();
  });

  it('should set minimal level to NONE', done => {
    const NONE = 4;

    var logger = new Marvin({level: 'None'});
    assert.equal(logger._level, NONE);

    logger = new Marvin({level: 'n'});
    assert.equal(logger._level, NONE);

    done();
  });

});

describe('Log levels', function() {

  it('should use DEBUG as minimal logging level', function(done) {
    var expectedCount = 6,
        logger = new Marvin({
          level: 'debug',
          consoleCallback: function() {
            assert.ok(expectedCount > 0);

            switch(expectedCount) {
              case 1:
                assert.ok(/http/.test(arguments['2']));
                break;
              case 2:
                assert.ok(/important/.test(arguments['2']));
                break;
              case 3:
                assert.ok(/error/.test(arguments['2']));
                break;
              case 4:
                assert.ok(/warn/.test(arguments['2']));
                break;
              case 5:
                assert.ok(/info/.test(arguments['2']));
                break;
              case 6:
                assert.ok(/debug/.test(arguments['2']));
                break;
            }

            --expectedCount;

            if (expectedCount === 0) {
              done();
            }
          }
        });

    assert.equal(logger.debug('debug'), true);
    assert.equal(logger.info('info'), true);
    assert.equal(logger.warn('warn'), true);
    assert.equal(logger.error('error'), true);
    assert.equal(logger.important('important'), true);
    assert.equal(logger.http('http'), true);
  });

  it('should use INFO as minimal logging level', function(done) {
    var expectedCount = 5,
        logger = new Marvin({
          level: 'info',
          consoleCallback: function() {
            assert.ok(expectedCount > 0);

            switch(expectedCount) {
              case 1:
                assert.ok(/http/.test(arguments['2']));
                break;
              case 2:
                assert.ok(/important/.test(arguments['2']));
                break;
              case 3:
                assert.ok(/error/.test(arguments['2']));
                break;
              case 4:
                assert.ok(/warn/.test(arguments['2']));
                break;
              case 5:
                assert.ok(/info/.test(arguments['2']));
                break;
            }

            --expectedCount;

            if (expectedCount === 0) {
              done();
            }
          }
        });

    assert.equal(logger.debug('debug'), false);
    assert.equal(logger.info('info'), true);
    assert.equal(logger.warn('warn'), true);
    assert.equal(logger.error('error'), true);
    assert.equal(logger.important('important'), true);
    assert.equal(logger.http('http'), true);
  });

  it('should use WARN as minimal logging level', function(done) {
    var expectedCount = 4,
        logger = new Marvin({
          level: 'warn',
          consoleCallback: function() {
            assert.ok(expectedCount > 0);

            switch(expectedCount) {
              case 1:
                assert.ok(/http/.test(arguments['2']));
                break;
              case 2:
                assert.ok(/important/.test(arguments['2']));
                break;
              case 3:
                assert.ok(/error/.test(arguments['2']));
                break;
              case 4:
                assert.ok(/warn/.test(arguments['2']));
                break;
            }

            --expectedCount;

            if (expectedCount === 0) {
              done();
            }
          }
        });

    assert.equal(logger.debug('debug'), false);
    assert.equal(logger.info('info'), false);
    assert.equal(logger.warn('warn'), true);
    assert.equal(logger.error('error'), true);
    assert.equal(logger.important('important'), true);
    assert.equal(logger.http('http'), true);
  });

  it('should use ERROR as minimal logging level', function(done) {
    var expectedCount = 3,
        logger = new Marvin({
          level: 'error',
          consoleCallback: function() {
            assert.ok(expectedCount > 0);

            switch(expectedCount) {
              case 1:
                assert.ok(/http/.test(arguments['2']));
                break;
              case 2:
                assert.ok(/important/.test(arguments['2']));
                break;
              case 3:
                assert.ok(/error/.test(arguments['2']));
                break;
            }

            --expectedCount;

            if (expectedCount === 0) {
              done();
            }
          }
        });

    assert.equal(logger.debug('debug'), false);
    assert.equal(logger.info('info'), false);
    assert.equal(logger.warn('warn'), false);
    assert.equal(logger.error('error'), true);
    assert.equal(logger.important('important'), true);
    assert.equal(logger.http('http'), true);
  });

  it('should use NONE as minimal logging level', function(done) {
    var expectedCount = 2,
        logger = new Marvin({
          level: 'none',
          consoleCallback: function() {
            assert.ok(expectedCount > 0);

            switch(expectedCount) {
              case 1:
                assert.ok(/http/.test(arguments['2']));
                break;
              case 2:
                assert.ok(/important/.test(arguments['2']));
                break;
            }

            --expectedCount;

            if (expectedCount === 0) {
              done();
            }
          }
        });

    assert.equal(logger.debug('debug'), false);
    assert.equal(logger.info('info'), false);
    assert.equal(logger.warn('warn'), false);
    assert.equal(logger.error('error'), false);
    assert.equal(logger.important('important'), true);
    assert.equal(logger.http('http'), true);
  });

});

describe('Console logging', function() {

  it('should correctly format date for console', done => {
    var now = new Date(),
        expected = '\u001b[90m' +
        ('0' + now.getHours()).slice(-2) +
        ':' + ('0' + now.getMinutes()).slice(-2) +
        ':' + ('0' + now.getSeconds()).slice(-2) +
        '\u001b[39m',
        logger = new Marvin({
          consoleCallback: function() {
            assert.equal(arguments['0'], expected);
            done();
          }
        });

    logger.debug('test');
  });

  it('should correctly format pid for console', done => {
    var expected = '\u001b[35mPID_' + process.pid + '\u001b[39m',
        logger = new Marvin({
          consoleCallback: function() {
            assert.equal(arguments['1'], expected);
            done();
          }
        });

    logger.debug('test');
  });

  it('should correctly format data with brackets for console', done => {
    var expected = '[\u001b[34mbrackets\u001b[39m] test',
        logger = new Marvin({
          consoleCallback: function() {
            assert.equal(Object.keys(arguments).length, 3);
            assert.equal(arguments['2'], expected);
            done();
          }
        });

    logger.debug('[brackets] test');
  });

  it('should correctly format object data for console', done => {
    var expected = '\u001b[34m{\n  "foo": "bar"\n}\u001b[39m',
        logger = new Marvin({
          consoleCallback: function() {
            assert.equal(Object.keys(arguments).length, 3);
            assert.equal(arguments['2'], expected);
            done();
          }
        });

    logger.debug({foo: 'bar'});
  });

  it('should correctly format debug data for console', done => {
    var expected = '\u001b[34mtest\u001b[39m',
        logger = new Marvin({
          consoleCallback: function() {
            assert.equal(Object.keys(arguments).length, 3);
            assert.equal(arguments['2'], expected);
            done();
          }
        });

    logger.debug('test');
  });

  it('should correctly format info data for console', done => {
    var expected = '\u001b[32mtest\u001b[39m',
        logger = new Marvin({
          consoleCallback: function() {
            assert.equal(Object.keys(arguments).length, 3);
            assert.equal(arguments['2'], expected);
            done();
          }
        });

    logger.info('test');
  });

  it('should correctly format warn data for console', done => {
    var expected = '\u001b[33mtest\u001b[39m',
        logger = new Marvin({
          consoleCallback: function() {
            assert.equal(Object.keys(arguments).length, 3);
            assert.equal(arguments['2'], expected);
            done();
          }
        });

    logger.warn('test');
  });

  it('should correctly format error data for console', done => {
    var expected = '\u001b[31mtest\u001b[39m',
        logger = new Marvin({
          consoleCallback: function() {
            assert.equal(Object.keys(arguments).length, 3);
            assert.equal(arguments['2'], expected);
            done();
          }
        });

    logger.error('test');
  });

  it('should correctly format important data for console', done => {
    var expected = '\u001b[35mtest\u001b[39m',
        logger = new Marvin({
          consoleCallback: function() {
            assert.equal(Object.keys(arguments).length, 3);
            assert.equal(arguments['2'], expected);
            done();
          }
        });

    logger.important('test');
  });

  it('should correctly format http data for console', done => {
    var expected = '\u001b[36mtest\u001b[39m',
        logger = new Marvin({
          consoleCallback: function() {
            assert.equal(Object.keys(arguments).length, 3);
            assert.equal(arguments['2'], expected);
            done();
          }
        });

    logger.http('test');
  });

});

describe('File logging', function() {

  it('should correctly format date for file', done => {
    var now = new Date(),
        expected = [
          now.getFullYear() +
          '/' + ('0' + (now.getMonth() + 1)).slice(-2) +
          '/' + ('0' + now.getDate()).slice(-2),
          ('0' + now.getHours()).slice(-2) +
          ':' + ('0' + now.getMinutes()).slice(-2) +
          ':' + ('0' + now.getSeconds()).slice(-2)
        ],
        logger = new Marvin({
          consoleCallback: function() {},
          fileCallback: function() {
            assert.equal(arguments['0'].split(' ')[0], expected[0]);
            assert.equal(arguments['0'].split(' ')[1], expected[1]);
            done();
          }
        });

    logger.debug('test');
  });

  it('should correctly format pid for file', done => {
    var expected = 'PID_' + process.pid,
        logger = new Marvin({
          consoleCallback: function() {},
          fileCallback: function() {
            assert.equal(arguments['0'].split(' ')[2], expected);
            done();
          }
        });

    logger.debug('test');
  });

  it('should correctly format debug data for file', done => {
    var expected = 'test\n',
        logger = new Marvin({
          consoleCallback: function() {},
          fileCallback: function() {
            var fields = arguments['0'].split(' ');
            assert.equal(fields.length, 4);
            assert.equal(fields[3], expected);
            done();
          }
        });

    logger.debug('test');
  });

  it('should correctly format data with brackets for file', done => {
    var expected = [
      '[brackets]',
      'test\n'
    ],
        logger = new Marvin({
          consoleCallback: function() {},
          fileCallback: function() {
            var fields = arguments['0'].split(' ');
            assert.equal(fields.length, 5);
            assert.equal(fields[3], expected[0]);
            assert.equal(fields[4], expected[1]);
            done();
          }
        });

    logger.debug('[brackets] test');
  });

  it('should correctly format object data for file', done => {
    var expected = /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} PID_\d+ {\n  "foo": "bar"\n}\n/,
        logger = new Marvin({
          consoleCallback: function() {},
          fileCallback: function() {
            assert.ok(expected.test(arguments['0']));
            done();
          }
        });

    logger.debug({foo: 'bar'});
  });

  it('should correctly format info data for file', done => {
    var expected = 'test\n',
        logger = new Marvin({
          consoleCallback: function() {},
          fileCallback: function() {
            var fields = arguments['0'].split(' ');
            assert.equal(fields.length, 4);
            assert.equal(fields[3], expected);
            done();
          }
        });

    logger.info('test');
  });

  it('should correctly format warn data for file', done => {
    var expected = 'test\n',
        logger = new Marvin({
          consoleCallback: function() {},
          fileCallback: function() {
            var fields = arguments['0'].split(' ');
            assert.equal(fields.length, 4);
            assert.equal(fields[3], expected);
            done();
          }
        });

    logger.warn('test');
  });

  it('should correctly format error data for file', done => {
    var expected = 'test\n',
        logger = new Marvin({
          consoleCallback: function() {},
          fileCallback: function() {
            var fields = arguments['0'].split(' ');
            assert.equal(fields.length, 4);
            assert.equal(fields[3], expected);
            done();
          }
        });

    logger.error('test');
  });

  it('should correctly format important data for file', done => {
    var expected = 'test\n',
        logger = new Marvin({
          consoleCallback: function() {},
          fileCallback: function() {
            var fields = arguments['0'].split(' ');
            assert.equal(fields.length, 4);
            assert.equal(fields[3], expected);
            done();
          }
        });

    logger.important('test');
  });

  it('should correctly format http data for file', done => {
    var expected = 'test\n',
        logger = new Marvin({
          consoleCallback: function() {},
          fileCallback: function() {
            var fields = arguments['0'].split(' ');
            assert.equal(fields.length, 4);
            assert.equal(fields[3], expected);
            done();
          }
        });

    logger.http('test');
  });

  it('should create log file and directory', done => {
    var logger = new Marvin({
      consoleCallback: function() {},
      logOutputDirectory: './test-tmp'
    });

    logger.debug('test');

    var now = new Date(),
        formattedDate = now.getFullYear() +
        '-' + ('0' + (now.getMonth() + 1)).slice(-2) +
        '-' + ('0' + now.getDate()).slice(-2);

    assert.ok(fs.existsSync('./test-tmp/' + formattedDate + '.log'));
    deleteFolderRecursive('./test-tmp/');
    done();
  });

});

describe('Express middleware logger', function() {

  it('should correctly log http request', done => {
    var express = require('express'),
        app = express(),
        logger = new Marvin({
          consoleCallback: function() {
            assert.ok(/\[.*?\] \/ \([0-9. ms]*\) \d{3} [0-9a-f.:]*/i.test(arguments['2']));
            done();
          }
        }),
        tester = null;

    app.use(logger.expressMiddleWare());
    app.get('*', function (req, res) {res.send('OK');});

    app.listen(4200, () => {
      tester = request(app).get('/');
      tester = tester.expect(404, () => {});
    });
  });

});
