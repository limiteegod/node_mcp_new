var CronJob = require("cron").CronJob;
var util = require("util");
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var moment = require('moment');
var async = require('async');
var platInterUtil = require('./app/util/PlatInterUtil.js');
var zzcInterUtil = require('./app/util/ZzcInterUtil.js');
var digestUtil = require('./app/util/DigestUtil.js');
var printMgDb = require('./app/config/PrintMgDb.js');
var prop = require('./app/config/Prop.js');
var zzc = prop.zzc;


var Printer = function(){
    var self = this;
    self.userId = 'C0001';
    self.channelCode = 'C0001';
    self.userType = 2;
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
};

Printer.prototype.plat = function(cmd, bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.channelCode, self.key, cmd, bodyNode, cb);
};


Printer.prototype.start = function()
{
    var self = this;
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
            printMgDb.check(function(){
                cb(null);
            });
        },
        //start get tickets from plat
        function(cb)
        {
            self.getTicketFromPlat();
            cb(null);
        },
        //start print
        function(cb)
        {
            self.print();
            cb(null);
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

Printer.prototype.saveTickets = function(tickets)
{
    var self = this;
    var ticketCol = printMgDb.get("ticket");
    for(var key in tickets)
    {
        var ticket = tickets[key];
        ticket._id = ticket.id; //rewrite the mgdb id
        ticket.status = prop.ticketStatus.received;
        var name = ticket.gameCode + "_" + ticket.playTypeCode + "_" + ticket.betTypeCode;
        var col = printMgDb.get(name);
        col.insert(ticket, function(err, data){
        });
        ticketCol.insert(ticket, function(err, data){
        });
    }
}

Printer.prototype.getTicketFromPlat = function()
{
    var self = this;
    self.getJob = new CronJob('*/5 * * * * *', function () {
        var hasNextPage = true;
        async.whilst(
            function() { return hasNextPage;},
            function(whiCb) {
                async.waterfall([
                    //get orders
                    function(cb)
                    {
                        var bodyNode = {size:10};
                        self.plat("P12", bodyNode, function(backMsgNode){
                            var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
                            var backBodyNode = JSON.parse(backBodyStr);
                            //if has next page, continue get tickets
                            hasNextPage = backBodyNode.pi.hasNextPage;
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
                        console.log('err: ', err);
                    }
                    else
                    {
                        whiCb();
                        console.log('result: ', result);
                    }
                });
            },
            function(err) {
                console.log('1.1 err: ', err); // -> undefined
            }
        );
    }, null, false, 'Asia/Shanghai');
    self.getJob.start();
};


/**
 * print the ticket
 */
Printer.prototype.print = function()
{
    var self = this;
    self.printJob = new CronJob('*/5 * * * * *', function () {
        //self.printT01_00_00();
        self.printF01_00_00();
    });
    self.printJob.start();
};

/**
 *  send the tickets to center
 */
Printer.prototype.sendT01_00_00 = function(tickets, cb)
{
    console.log("send tickets");

    var ticketIds = [];
    for(var key in tickets)
    {
        ticketIds[ticketIds.length] = tickets[key]._id;
    }

    //send to center


    var col = printMgDb.get("ticket");
    col.update({_id:{$in:ticketIds}}, {$set:{status:prop.ticketStatus.send}}, {multi:true}, function(err, data){
        console.log("update length----------------:" + data);
        cb();
    });
};

/**
 *  send the tickets to center
 */
Printer.prototype.sendF01_00_00 = function(tickets, cb)
{
    var col = printMgDb.get("ticket");
    var time = moment().format(zzc.dateFmt);
    async.each(tickets, function(row, callback) {
        printMgDb.getZzcId(function(err, data){
            row.zzcId = time + (10000000 + data.value%10000000);
            col.update({_id:row._id}, {$set:{status:prop.ticketStatus.send, zzcId:row.zzcId}}, {}, function(err, data){
                callback();
            });
        });
    }, function(err){
        if(err) throw err;
        zzcInterUtil.sendTickets(tickets, function(err, data){
            if(err)
            {
                var ticketIds = [];
                for(var key in tickets)
                {
                    ticketIds[ticketIds.length] = ticketIds[key]._id;
                }
                col.update({_id:{$in:ticketIds}}, {$set:{status:prop.ticketStatus.send_failure}}, {multi:true}, function(err, data){});
            }
            else
            {
                //see the xml, if failure, change the db
            }
            cb();
        });
    });
};

/**
 * print the ticket
 */
Printer.prototype.printT01_00_00 = function()
{
    var self = this;
    var name = 'T01_00_00';
    var col = printMgDb.get(name);
    var continuable = true;
    var ticketArray = [];
    async.whilst(
        function() { return continuable;},
        function(whiCb) {
            col.findAndRemove({}, {}, {}, function(err, data){
                if(data)
                {
                    ticketArray[ticketArray.length] = data;
                    if(ticketArray.length == 50)
                    {
                        self.sendT01_00_00(ticketArray, function(){
                            whiCb();
                            ticketArray = [];
                        });
                    }
                    else
                    {
                        whiCb();
                    }
                }
                else
                {
                    if(ticketArray.length > 0)
                    {
                        self.sendT01_00_00(ticketArray, function(){
                            whiCb();
                            ticketArray = [];
                        });
                        ticketArray = [];
                    }
                    else
                    {
                        whiCb();
                    }
                    continuable = false;
                }
            });
        },
        function(err) {
            console.log('1.1 err: ', err); // -> undefined
        }
    );
};

/**
 * print the ticket
 */
Printer.prototype.printF01_00_00 = function()
{
    var self = this;
    var name = 'F01_00_00';
    var col = printMgDb.get(name);
    var continuable = true;
    var ticketArray = [];
    async.whilst(
        function() { return continuable;},
        function(whiCb) {
            col.findAndRemove({}, {}, {}, function(err, data){
                if(data)
                {
                    ticketArray[ticketArray.length] = data;
                    if(ticketArray.length == 50)
                    {
                        self.sendF01_00_00(ticketArray, function(){
                            whiCb();
                            ticketArray = [];
                        });
                    }
                    else
                    {
                        whiCb();
                    }
                }
                else
                {
                    if(ticketArray.length > 0)
                    {
                        self.sendF01_00_00(ticketArray, function(){
                            whiCb();
                            ticketArray = [];
                        });
                        ticketArray = [];
                    }
                    else
                    {
                        whiCb();
                    }
                    continuable = false;
                }
            });
        },
        function(err) {
            console.log('1.1 err: ', err); // -> undefined
        }
    );
};

var p = new Printer();
p.start()