var log4js = require('log4js');
var config = require('config');
log4js.configure(config.loggerConfig.config);
var logger = log4js.getLogger(config.loggerConfig.usage.usingCategory);

exports.default = logger;
module.exports = exports['default'];