var async = require('async');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var dc = require('../config/DbCenter.js');
var errCode = require('../config/ErrCode.js');
var prop = require('../config/Prop.js');
var log = esut.log;
var dateUtil = esut.dateUtil;
var mgKvService = require("../service/MgKvService.js");
var stationService = require("../service/StationService.js");

var TradeControl = function(){};

TradeControl.prototype.handle = function(headNode, bodyStr, userCb)
{
    var self = this;
    async.waterfall([
        //check login state
        function(cb){
            var stationTable = dc.main.get("station");
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
        ticket.status = prop.ticketStatus.waiting_print;
    }
    var stationGameTable = dc.main.get("stationgame");
    var stationTable = dc.main.get("station");
    var orderTable = dc.main.get("torder");
    var ticketTable = dc.main.get("tticket");
    var termTable = dc.main.get("term");
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
                        cb(errCode.E2003);
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
                        cb(null, term);
                    }
                }
            });
        },
        //校验期次状态
        function(term, cb)
        {
            if(term.status != prop.termStatus.ON_SALE && term.status != prop.termStatus.NOT_ON_SALE)
            {
                cb(errCode.E2008);
            }
            else
            {
                cb(null);
            }
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
            stationService.buyLot(user.id, torder.amount, function(err, data){
                cb(err, pstation);
            });
        },
        //save the order
        function(pstation, cb)
        {
            torder.printStationId = pstation.id;
            orderTable.save(torder, [], function(err, data){
                cb(null, pstation);
            });
        },
        //save the tickets
        function(pstation, cb)
        {
            async.each(tickets, function(ticket, callback) {
                ticket.printerStationId = pstation.id;
                ticketTable.save(ticket, [], function(err, data){
                    callback();
                });
            }, function(err){
                cb(null, pstation);
            });
        },
        function(pstation, cb)
        {
            var printQueen = dc.mg.pool.getConn().conn.collection("print_queen_" + pstation.code);
            mgKvService.getPrintSeqId(function(err, data){
                printQueen.save({_id:data.value, orderId:torder.id,
                    gameCode:torder.gameCode, termCode:torder.termCode}, [], function(err, data){
                    log.info(err);
                    log.info(data);
                    cb(null);
                });
            });
        }
    ], function (err) {
        var backBodyNode = {};
        if(!err)
        {
            var repOrder = {id:torder.id, status:torder.status, schemeType:torder.schemeType};
            backBodyNode.order = repOrder;
        }
        cb(err, backBodyNode);
    });
};

var tradeControl = new TradeControl();
module.exports = tradeControl;