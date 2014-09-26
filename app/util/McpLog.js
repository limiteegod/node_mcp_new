var dateUtil = require('./DateUtil.js');
var async = require('async');
var moment = require("moment");

var McpLog = function(){};

McpLog.prototype.info = function(data)
{
    console.log(dateUtil.getLogTime(), data);
};

module.exports = new McpLog();