var prop = require('./app/config/Prop.js');
var platInterUtil = require('./app/util/PlatInterUtil.js');
var digestUtil = require("./app/util/DigestUtil.js");
var log = require('./app/util/McpLog.js');

var PrintTest = function(){
    var self = this;
    self.userId = 'C0001';
    self.channelCode = 'C0001';
    self.userType = 2;
    self.digestType = "md5";
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
};

PrintTest.prototype.plat = function(cmd, bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.channelCode, self.digestType, self.key, cmd, bodyNode, cb);
};

PrintTest.prototype.P12 = function()
{
    var self = this;
    var bodyNode = {size:3};
    self.plat("P12", bodyNode, function(err, backMsgNode){
        if(err)
        {
            log.info(err);
        }
        else
        {
            log.info(backMsgNode);
            var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            var backBodyNode = JSON.parse(backBodyStr);
            console.log(backBodyNode);
        }
    });
};

PrintTest.prototype.P06 = function(orderId)
{
    var self = this;
    var bodyNode = {orderId:orderId};
    self.plat("P06", bodyNode, function(err, backMsgNode){
        if(err)
        {
            log.info(err);
        }
        else
        {
            log.info(backMsgNode);
            var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            var backBodyNode = JSON.parse(backBodyStr);
            console.log(backBodyNode);
        }
    });
};

PrintTest.prototype.P02 = function(ticketId, code, rNumber)
{
    var self = this;
    var bodyNode = {ticketId:ticketId, code:code, rNumber:rNumber};
    self.plat("P02", bodyNode, function(err, backMsgNode){
        if(err)
        {
            log.info(err);
        }
        else
        {
            log.info(backMsgNode);
            var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
            var backBodyNode = JSON.parse(backBodyStr);
            console.log(backBodyNode);
        }
    });
};

var pt = new PrintTest();
pt.P02('3c43faffff8f4d298e9068958cd8da02', prop.printStatus.success, '');
//pt.P06('9c4c9c2c3ad348ad8b73bdf4eb40c333');
//pt.P12();