var CronJob = require("cron").CronJob;
var async = require('async');
var platInterUtil = require('./app/util/PlatInterUtil.js');
var digestUtil = require('./app/util/DigestUtil.js');
var printMgDb = require('./app/config/PrintMgDb.js');


var Printer = function(){
    var self = this;
    self.userId = 'C0001';
    self.channelCode = 'C0001';
    self.userType = 2;
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
    self.cmd = 'P12';
    self.jcCmd = 'T06';
};

Printer.prototype.plat = function(cmd, bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.channelCode, self.key, cmd, bodyNode, cb);
};


Printer.prototype.start = function()
{
    var self = this;
    console.log(new Date().toString());
    async.waterfall([
        //connect mdb
        function(cb)
        {
            printMgDb.connect(function(err, db){
                cb(err);
            });
        },
        //check mdb data
        function(cb)
        {
            printMgDb.check();
            cb(null);
        },
        //start print
        function(cb)
        {
            self.print();
        }
    ], function (err, result) {
        if(err)
        {
            console.log('err: ', err); // -> null
        }
        else
        {
            console.log('result: ', result); // -> 16
        }
    });

    /*self.jobid = new CronJob('*//*5 * * * * *', function () {
        console.log("get orders from plat.");
    }, null, false, 'Asia/Shanghai');
    self.jobid.start();*/
};

Printer.prototype.saveTickets = function(tickets)
{
    var self = this;
    console.log(tickets);
    for(var key in tickets)
    {
        var ticket = tickets[key];
        var name = ticket.gameCode + "_" + ticket.playTypeCode + "_" + ticket.betTypeCode;
        var col = printMgDb.get(name);
        col.insert(ticket, function(err, data){
            console.log(err);
            console.log(data);
        });
    }
}

Printer.prototype.print = function()
{
    var self = this;
    async.waterfall([
        //get orders
        function(cb)
        {
            var bodyNode = {size:10};
            self.plat("P12", bodyNode, function(backMsgNode){
                var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
                var backBodyNode = JSON.parse(backBodyStr);
                console.log("back-body:");
                console.log(backBodyNode);

                cb(null, backBodyNode.rst);
            });
        },
        //get tickets
        function(orders, cb)
        {
            for(var key in orders)
            {
                var order = orders[key];
                var bodyNode = {orderId:order.orderId};
                self.plat("P06", bodyNode, function(backMsgNode){
                    var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
                    var backBodyNode = JSON.parse(backBodyStr);
                    self.saveTickets(backBodyNode.tickets);
                });
            }
            cb(null, "OK");
        }
    ], function (err, result) {
        if(err)
        {
            console.log('err: ', err); // -> null
        }
        else
        {
            console.log('result: ', result); // -> 16
        }
    });
};

var p = new Printer();
p.start()