var async = require('async');
var digestUtil = require("../util/DigestUtil.js");
var db = require('../config/McpDataBase.js');
var errCode = require('../config/ErrCode.js');
var prop = require('../config/Prop.js');
var loginControl = require('./LoginControl.js');
var log = require('../util/McpLog.js');
var mcpMgDb = require('../config/McpMgDb.js');
var dateUtil = require("../util/DateUtil.js");

var TradeControl = function(){};

TradeControl.prototype.handle = function(headNode, bodyStr, userCb)
{
    var self = this;
    async.waterfall([
        //check login state
        function(cb){
            var stationTable = db.get("station");
            if(headNode.cmd == 'T03')
            {
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
                                headNode.key = data[0].secretKey;
                                var bodyNode = JSON.parse(decodedBodyStr);
                                cb(null, data[0], headNode, bodyNode);
                            }
                        }
                    }
                });
            }
        },
        //check body
        function(user, headNode, bodyNode, cb){
            var cmd = 'handle' + headNode.cmd;
            self[cmd](user, headNode, bodyNode, cb);
        }
    ], function (err, backBodyNode) {
        userCb(err, backBodyNode);
    });
};

/**
 * find one's all operations
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
TradeControl.prototype.handleT03 = function(user, headNode, bodyNode, cb)
{
    var self = this;
    var torder = bodyNode.order;
    torder.id = digestUtil.createUUID();
    torder.stationId = user.id;
    torder.channelCode = headNode.channelCode;
    var curTime = dateUtil.getCurTime();
    torder.createTime = curTime;
    torder.acceptTime = curTime;
    torder.customerId = user.id;
    torder.schemeType = prop.schemeType.none;
    var tickets = torder.tickets;
    torder.ticketCount = tickets.length;
    torder.bonus = 0;
    torder.bonusBeforeTax = 0;
    torder.payType = prop.payType.cash;
    torder.status = prop.orderStatus.waiting_print;
    torder.finishedTicketCount = 0;
    torder.printCount = 0;
    torder.printFailCount = 0;
    torder.type = prop.orderType.channel;
    for(var key in tickets)
    {
        var ticket = tickets[key];
        ticket.id = digestUtil.createUUID();
        ticket.orderId = torder.id;
        ticket.finishedCount = 0;
        ticket.stationId = torder.stationId;
        ticket.customerId = torder.customerId;
        ticket.channelCode = torder.channelCode;
        ticket.gameCode = torder.gameCode;
        ticket.termCode = torder.termCode;
        var playType = prop.getGameInfo(ticket.gameCode, ticket.playTypeCode);
        ticket.price = playType.price;
        ticket.seq = parseInt(key) + 1;
        ticket.createTime = curTime;
        ticket.acceptTime = curTime;
        ticket.bonus = 0;
        ticket.bonusBeforeTax = 0;
        ticket.bigBonus = 0;
        ticket.version = 0;
    }
    var stationGameTable = db.get("stationgame");
    var stationTable = db.get("station");
    var orderTable = db.get("torder");
    var ticketTable = db.get("tticket");
    var termTable = db.get("term");
    var gameCode = torder.gameCode;
    async.waterfall([
        //check the term
        function(cb)
        {
            termTable.find({gameCode:torder.gameCode, code:torder.termCode},
                {status:1, endTime:1}).toArray(function(err, data){
                if(err)
                {
                    cb(err);
                }
                else
                {
                    if(data.length < 1)
                    {
                        cb(errCode.E2003)
                    }
                    else
                    {
                        var term = data[0];
                        log.info("term--------------------");
                        log.info(term);
                        for(var key in tickets)
                        {
                            var ticket = tickets[key];
                            ticket.termIndex = 0;
                            ticket.termIndexDeadline = term.endTime;
                        }
                        cb(null);
                    }
                }
            });
        },
        //get station game
        function(cb)
        {
            stationGameTable.find({stationId:user.id, gameCode:gameCode},
                {relayToId:1}).toArray(function(err, data){
                    cb(null, data[0]);
                });
        },
        //get printer station
        function(sg, cb)
        {
            stationTable.find({id:sg.relayToId}, {code:1}).toArray(function(err, data){
                cb(null, data[0]);
            });
        },
        //decrease the money of station
        function(pstation, cb)
        {
            log.info("station money.........................");

            var success = false;
            async.whilst(
                function() { return !success},
                function(whileCb) {
                    stationTable.find({id:user.id}, {version:1, balance:1}).toArray(function(err, data){
                        var user = data[0];
                        stationTable.update({id:user.id, version:user.version},
                            {$inc:{balance:(-1)*torder.amount}, $set:{version:user.version + 1}}, {}, function(err, data){
                                log.info(data);
                                if(data.updateCount == 1)
                                {
                                    success = true;
                                }
                                whileCb();
                            });
                    });
                },
                function(err) {
                    cb(null, pstation);
                }
            );
        },
        //save the order
        function(pstation, cb)
        {
            torder.printStationId = pstation.id;
            orderTable.save(torder, function(err, data){
                cb(null, pstation);
            });
        },
        //save the tickets
        function(pstation, cb)
        {
            async.each(tickets, function(ticket, callback) {
                ticketTable.save(ticket, function(err, data){
                    callback();
                });
            }, function(err){
                cb(null, pstation);
            });
        },
        function(pstation, cb)
        {
            var printQueen = mcpMgDb.get("print_queen_" + pstation.code);
            mcpMgDb.getPrintSeqId(function(err, data){
                printQueen.save({_id:data.value, orderId:torder.id,
                    gameCode:torder.gameCode, termCode:torder.termCode}, {}, function(err, data){
                    log.info(err);
                    log.info(data);
                    cb(null);
                });
            });
        }
    ], function (err) {
        var backBodyNode = {};
        cb(err, backBodyNode);
    });
};

var tradeControl = new TradeControl();
module.exports = tradeControl;