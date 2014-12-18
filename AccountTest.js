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

var AccountTest = function(){
    var self = this;
    self.userId = 'Q0003';
    self.channelCode = 'Q0003';
    self.userType = 2;
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
};

AccountTest.prototype.at = function(cmd, bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.channelCode, "md5", self.key, cmd, bodyNode, cb);
};

AccountTest.prototype.A01 = function(bodyNode, cb)
{
    var self = this;
    self.at("A01", bodyNode, function(err, backMsgNode){
        if(err)
        {
            cb(err, null);
        }
        else
        {
            var backBodyStr = backMsgNode.body;
            var backBodyNode = JSON.parse(backBodyStr);
            cb(null, backBodyNode);
        }
    });
};

AccountTest.prototype.A04 = function(bodyNode, cb)
{
    var self = this;
    self.at("A04", bodyNode, function(err, backMsgNode){
        if(err)
        {
            cb(err, null);
        }
        else
        {
            var backBodyStr = backMsgNode.body;
            var backBodyNode = JSON.parse(backBodyStr);
            cb(null, backBodyNode);
        }
    });
};

AccountTest.prototype.S01 = function(userId, st, bodyNode, cb)
{
    var self = this;
    platInterUtil.get(userId, self.userType, self.channelCode, "md5", st, "S01", bodyNode, function(err, backMsgNode){
        if(err)
        {
            cb(err, null);
        }
        else
        {
            var backBodyStr = digestUtil.check(backMsgNode.head, st, backMsgNode.body);
            var backBodyNode = JSON.parse(backBodyStr);
            cb(null, backBodyNode);
        }
    });
};

var accountTest = new AccountTest();

/*var bodyNode = {customer:{name:'liming', password:'123456'}};
accountTest.A01(bodyNode, function(err, backBodyNOde){
    log.info(err);
    log.info(backBodyNOde);
});*/

var bodyNode = {name:'liming', password:'123456'};
accountTest.A04(bodyNode, function(err, backBodyNode){
    log.info(err);
    log.info(backBodyNode);

    var s01BodyNode = {scheme:{
        gameCode:'F01', startTermCode:2014001,
        numList:'00~00~06,08,09,12,22,32|02~200~1',
        amount:800, orderCount:4
    }};
    accountTest.S01(backBodyNode.customer.id, backBodyNode.st, s01BodyNode, function(err, backBodyNode){
        log.info(err);
        log.info(backBodyNode);
    });
});





