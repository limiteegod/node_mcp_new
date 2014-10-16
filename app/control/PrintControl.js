var async = require('async');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var dateUtil = esut.dateUtil;
var errCode = require('../config/ErrCode.js');
var prop = require('../config/Prop.js');
var log = esut.log;
var pageUtil = esut.pageUtil;
var dc = require('../config/DbCenter.js');
var ticketStatus = require('../config/TicketStatus.js');
var orderService = require('../service/OrderService.js');
var ticketService = require('../service/TicketService.js');
var stationService = require('../service/StationService.js');

var PrintControl = function(){};

PrintControl.prototype.handle = function(headNode, bodyStr, userCb)
{
    var self = this;
    async.waterfall([
        //check login state
        function(cb){
            var stationTable = dc.main.get("station");
            stationTable.find({code:headNode.channelCode}, {}).toArray(function(err, data){
                if(err)
                {
                    cb(errCode.E0999);
                }
                else
                {
                    if(data.length != 1)
                    {
                        cb(errCode.E2035);
                    }
                    else
                    {
                        var decodedBodyStr = digestUtil.check(headNode, data[0].secretKey, bodyStr);
                        if(!decodedBodyStr)
                        {
                            cb(errCode.E0001);
                        }
                        else
                        {
                            var bodyNode = JSON.parse(decodedBodyStr);
                            cb(null, data[0], headNode, bodyNode);
                        }
                    }
                }
            });
        },
        //check body
        function(user, headNode, bodyNode, cb){
            var cmd = 'handle' + headNode.cmd;
            headNode.key = user.secretKey;
            self[cmd](user, headNode, bodyNode, cb);
        }
    ], function (err, backBodyNode) {
        userCb(err, backBodyNode);
    });
};

/**
 * find print center's print queen.
 * bodyNode.size should bet set, if not set, it will be 10.
 * @param user the print center.
 * @param headNode
 * @param bodyNode bodyNode.rst is the result, bodyNode.pi is the page info.
 * @param cb
 */
PrintControl.prototype.handleP12 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    var skip = 0;
    var limit = bodyNode.size;
    if(!limit)
    {
        limit = 10;
    }
    log.info("print_queen_" + user.code);
    var printQueen = dc.mg.pool.getConn().conn.collection("print_queen_" + user.code);
    var cursor = printQueen.find({}, {}).sort({_id:1}).skip(0).limit(limit);
    cursor.toArray(function(err, data){
        if(err)
        {
            cb(null, backBodyNode);
        }
        else
        {
            var maxId = -1;
            for(var key in data)
            {
                data[key].id = data[key]._id;
                data[key]._id = undefined;
                if(data[key].id > maxId)
                {
                    maxId = data[key].id;
                }
            }
            backBodyNode.rst = data;
            cursor.count(function(err, count){
                printQueen.remove({_id:{$lte:maxId}}, [], function(err, data){
                    backBodyNode.pi = pageUtil.getDetail(skip, limit, count);
                    cb(null, backBodyNode);
                });
            });
        }
    });
};

/**
 * print center get tickets to print by orderId.
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
PrintControl.prototype.handleP06 = function(user, headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {};
    var orderId = bodyNode.orderId;
    var ticketTable = dc.main.get("tticket");
    ticketTable.find({orderId:orderId, status:prop.ticketStatus.waiting_print},
        {orderId:1, seq:1, termCode:1, gameCode:1, betTypeCode:1,
            playTypeCode:1, amount:1, multiple:1, price:1, numbers:1,
            termIndexDeadline:1, version:1})
        .toArray(function(err, data){
        var rst = [];
        var curTimeStamp = new Date().getTime();
        async.each(data, function(ticket, callback) {
            ticketTable.update({id:ticket.id, version:ticket.version},
                {$set:{sysTakeTime:curTimeStamp, status:prop.ticketStatus.take_away,
                    version:ticket.version+1}},
                {}, function(err, data){
                    if(err)
                    {
                        log.info(err);
                    }
                    else
                    {
                        if(data.affectedRows == 1)
                        {
                            ticket.version = undefined;
                            rst[rst.length] = ticket;
                        }
                    }
                    callback();
                });
        }, function(err){
            backBodyNode.tickets = rst;
            cb(null, backBodyNode);
        });
    });
};

/**
 * print center tell platform the printing status of ticket.
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
PrintControl.prototype.handleP02 = function(user, headNode, bodyNode, outerCb)
{
    var self = this;
    var backBodyNode = {};
    var ticketTable = dc.main.get("tticket");
    async.waterfall([
        //select ticket from db
        function(cb)
        {
            ticketTable.find({id:bodyNode.ticketId}, {amount:1, gameCode:1, status:1, version:1}).toArray(function(err, data) {
                if (err) throw err;
                if (data.length > 0) {
                    cb(null, data[0]);
                }
                else
                {
                    cb(errCode.E3001);
                }
            });
        },
        //check the ticket status
        function(ticket, cb)
        {
            if(ticket.status != prop.ticketStatus.take_away)
            {
                cb(errCode.E3002);
            }
            else
            {
                cb(null, ticket);
            }
        },
        //update the ticket status
        function(ticket, cb)
        {
            if(bodyNode.code == prop.printStatus.success)
            {
                ticket.status = ticketStatus.print_success;
                ticket.rNumber = bodyNode.rNumber;
            }
            else
            {
                ticket.status = ticketStatus.print_failure;
            }
            ticketService.printBack(ticket, cb);
        },
        //如果打印成功，则出票机构获得出票提成
        function(ticket, cb)
        {
            if(ticket.status == ticketStatus.print_success)
            {
                stationService.printSuccess(ticket, function(err, station){
                    cb(err, ticket, station);
                });
            }
            else
            {
                cb(err, ticket, null);
            }
        },
        //increase the ticket count of torder
        function(ticket, success, cb)
        {
            if(success)
            {
                orderService.incSuccessTicketCount(ticket.orderId, function(err, order){
                    cb(null, ticket, success);
                });
            }
            else
            {
                cb(null, ticket, success);
            }
        },
        //sale station get the sale percentage
        function(ticket, success, cb)
        {
            if(success)
            {
                var stationGameTable = dc.main.get("stationgame");
                var stationTable = dc.main.get("station");
                async.waterfall([
                    //get station game
                    function(cb)
                    {
                        stationGameTable.find({stationId:user.id, gameCode:ticket.gameCode},
                            {pFactor:1}).toArray(function(err, data){
                                cb(null, data[0]);
                            });
                    },
                    //print station get the money
                    function(sg, cb)
                    {
                        log.info(sg);
                        var amount = (sg.pFactor/10000)*ticket.amount;
                        var success = false;
                        async.whilst(
                            function() { return !success},
                            function(whileCb) {
                                stationTable.find({id:user.id}, {version:1, balance:1}).toArray(function(err, data){
                                    var user = data[0];
                                    stationTable.update({id:user.id, version:user.version},
                                        {$inc:{balance:amount}, $set:{version:user.version + 1}}, {}, function(err, data){
                                            if(data.affectedRows == 1)
                                            {
                                                success = true;
                                            }
                                            whileCb();
                                        });
                                });
                            },
                            function(err) {
                                cb(null);
                            }
                        );
                    },
                    //sale station get the money.
                    function(cb)
                    {
                        cb(null);
                    }
                ], function(err) {
                    cb(null, ticket, success);
                });
            }
            else
            {
                cb(null, ticket, success);
            }
        }
    ], function (err) {
        outerCb(err, backBodyNode);
    });
};

var printControl = new PrintControl();
module.exports = printControl;