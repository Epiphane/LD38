process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./engine/config/environment');

require('./engine/config/seed')(); 