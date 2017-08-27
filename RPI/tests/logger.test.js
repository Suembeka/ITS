var logger = require('../modules/logger');

logger.output = 'file';
logger.log({file:__filename, msg: 'Hello from log'});
logger.info({file:__filename, msg: 'Hello from info'});
logger.error({file:__filename, msg: 'Hello from error'});
logger.debug({file:__filename, msg: 'Hello from debug'});


logger.output = 'console';
logger.log({file:__filename, msg: 'Hello from log'});
logger.info({file:__filename, msg: 'Hello from info'});
logger.error({file:__filename, msg: 'Hello from error'});
logger.debug({file:__filename, msg: 'Hello from debug'});