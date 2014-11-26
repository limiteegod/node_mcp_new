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

var PrintTest = function(){
    var self = this;
    self.userId = 'T00001';
    self.channelCode = 'T00001';
    self.userType = 2;
    self.key = '123456';
};

PrintTest.prototype.print = function(cmd, bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.channelCode, "md5", self.key, cmd, bodyNode, cb);
};

PrintTest.prototype.printP02 = function(bodyNode, cb)
{
    var self = this;
    self.print("P02", bodyNode, function(err, backMsgNode){
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

PrintTest.prototype.printP06 = function(bodyNode, cb)
{
    var self = this;
    self.print("P06", bodyNode, function(err, backMsgNode){
        log.info(backMsgNode);
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

PrintTest.prototype.printP12 = function(bodyNode, cb)
{
    var self = this;
    self.print("P12", bodyNode, function(err, backMsgNode){
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

PrintTest.prototype.printUtilEmpty = function()
{
    var self = this;
    async.waterfall([
        //取订单队列
        function(cb)
        {
            var bodyNode = {size:20};
            self.printP12(bodyNode, function(err, p12BackBodyNode) {
                if(p12BackBodyNode)
                {
                    var orders = p12BackBodyNode.rst;
                    if(orders && orders.length > 0)
                    {
                        cb(null, orders);
                    }
                    else
                    {
                        cb("no order to print.....................");
                    }
                }
                else
                {
                    cb(err);
                }
            });
        },
        //用订单号取票
        function(orders, cb)
        {
            var ticketsToPrint = [];
            async.eachSeries(orders, function(order, callback) {
                var p06BodyNode = {orderId:order.orderId};
                self.printP06(p06BodyNode, function(err, p06BackBodyNode) {
                    if(p06BackBodyNode)
                    {
                        var tickets = p06BackBodyNode.tickets;
                        if(tickets && tickets.length > 0)
                        {
                            for(var key in tickets)
                            {
                                ticketsToPrint[ticketsToPrint.length] = tickets[key];
                            }
                        }

                    }
                    callback();
                });
            }, function(err){
                cb(err, ticketsToPrint);
            });
        },
        //返回出票结果
        function(tickets, cb)
        {
            async.eachSeries(tickets, function(ticket, callback) {
                var backTicket = {};
                backTicket.ticketId = ticket.id;
                backTicket.terminalCode = "test";
                backTicket.stubInfo = digestUtil.createUUID();
                backTicket.paper = false;
                backTicket.rNumber = ticket.numbers;
                backTicket.code = printStatus.success;
                self.printP02(backTicket, function(err, p02BackBodyNode){
                    log.info(p02BackBodyNode);
                    callback(err);
                });
            }, function(err){
                cb(err);
            });
        }
    ], function (err, rst) {
        if(err)
        {
            log.info(err);
        }
        else
        {
            self.printUtilEmpty();
        }
    });
};

var printTest = new PrintTest();
var printJob = new CronJob('*/20 * * * * *', function () {
    printTest.printUtilEmpty();
});
printJob.start();




