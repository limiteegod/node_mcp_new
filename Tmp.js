var async = require('async');
var CronJob = require("cron").CronJob;

var platInterUtil = require('mcp_util').platInterUtil;
var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var cons = require('mcp_cons');
var ticketStatus = cons.ticketStatus;
var printStatus = cons.printStatus;
var userType = cons.userType;

var QueryTest = function(){
    var self = this;
    self.userId = 'Q0003';
    self.channelCode = 'Q0003';
    self.userType = 2;
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
};

QueryTest.prototype.query = function(cmd, bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.channelCode, "md5", self.key, cmd, bodyNode, cb);
};

QueryTest.prototype.queryQ17 = function(bodyNode, cb)
{
    var self = this;
    self.query("Q17", bodyNode, function(err, backMsgNode){
        if(err)
        {
            cb(err, null);
        }
        else
        {
            var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            var backBodyNode = JSON.parse(backBodyStr);
            cb(null, backBodyNode);
        }
    });
};

var queryTest = new QueryTest();
queryTest.queryQ17({}, function(err, backBodyNode){
    log.info(err);
    log.info(backBodyNode);
});




