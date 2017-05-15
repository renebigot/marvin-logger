var logger = require('../index.js').sharedInstance;

logger.debug('[debug]', 'debug message');
logger.debug('Another debug message with object', {str: 'foo', count: 42, isTrue: false, nullElement: null, myArray: ['foo', 'bar']});

logger.info('[info]', 'info message');
logger.info('Another info message');

logger.warn('[warning]', 'warning message');
logger.warn('Another warning message');

logger.error('[error]', 'error message');
logger.error('Another error message');

logger.important('[important]', 'important message');
logger.important('Another important message');

logger.http('[http]', 'http message');
logger.http('Another http message');
