var async = require('async');
var digestUtil = require("../util/DigestUtil.js");
var db = require('../config/McpDataBase.js');
var errCode = require('../config/ErrCode.js');
var prop = require('../config/Prop.js');
var loginControl = require('./LoginControl.js');
var log = require('../util/McpLog.js');
var mcpMgDb = require('../config/McpMgDb.js');

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
    var tickets = torder.tickets;
    var stationGameTable = db.get("stationgame");
    var stationTable = db.get("station");
    var gameCode = torder.gameCode;
    async.waterfall([
        //get station game
        function(cb)
        {
            stationGameTable.find({stationId:user.id, gameCode:gameCode},
                {relayToId:1}).toArray(function(err, data){
                    log.info(data);
                    cb(null, data[0]);
                });
        },
        //get printer station
        function(sg, cb)
        {
            stationTable.find({id:sg.relayToId}, {code:1}).toArray(function(err, data){
                log.info(data);
                cb(null, data[0]);
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
        headNode.key = user.secretKey;
        var backBodyNode = {};
        cb(null, backBodyNode);
    });
};

var tradeControl = new TradeControl();
module.exports = tradeControl;