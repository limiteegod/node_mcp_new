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
    self.userId = 'C0001';
    self.channelCode = 'C0001';
    self.userType = 2;
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
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
        //取票
        function(cb)
        {
            printTest.printP01(function(err, backBodyNode){
                log.info(backBodyNode);
                if(backBodyNode)
                {
                    var tickets = backBodyNode.rst;
                    if(tickets.length == 0)
                    {
                        cb("no tickets to print........");
                        return;
                    }
                    var rst = [];
                    async.each(tickets, function(ticket, callback) {
                        rst[rst.length] = {id:ticket.id,
                            status:ticketPrintStatus.PRINT_SUCCESS, province:'bj',
                        seq:digestUtil.createUUID(), terminal:'123456', rNumber:ticket.number};
                        callback();
                    }, function(err){
                        cb(err, rst);
                    });
                }
            });
        },
        //返回出票结果
        function(rst, cb)
        {
            var bodyNode = {};
            bodyNode.rst = rst;
            printTest.printP02(bodyNode, function(err, backBodyNode){
                log.info(backBodyNode);
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
}


var printTest = new PrintTest();
var bodyNode = {size:1};
printTest.printP12(bodyNode, function(err, p12BackBodyNode){
    log.info(p12BackBodyNode);
    if(p12BackBodyNode.rst.length > 0)
    {
        var order = p12BackBodyNode.rst[0];
        var p06BodyNode = {orderId:order.orderId};
        printTest.printP06(p06BodyNode, function(err, p06BackBodyNode){
            log.info(p06BackBodyNode);
            var tickets = p06BackBodyNode.tickets;
            async.eachSeries(tickets, function(ticket, callback) {
                var backTicket = {};
                backTicket.ticketId = ticket.id;
                backTicket.terminalCode = "1234";
                backTicket.stubInfo = "99999999999999";
                backTicket.paper = false;
                backTicket.rNumber = ticket.numbers;
                backTicket.code = printStatus.success;

                printTest.printP02(backTicket, function(err, p02BackBodyNode){
                    log.info(p02BackBodyNode);
                    callback()
                });
            }, function(err){
                log.info("finished...............");
            });
        });
    }
});

/*var printJob = new CronJob('*//*10 * * * * *', function () {
    printTest.printUtilEmpty();
});
printJob.start();*/




