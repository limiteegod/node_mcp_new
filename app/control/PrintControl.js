var async = require('async');
var digestUtil = require("../util/DigestUtil.js");
var dateUtil = require("../util/DateUtil.js");
var db = require('../config/McpDataBase.js');
var errCode = require('../config/ErrCode.js');
var prop = require('../config/Prop.js');
var loginControl = require('./LoginControl.js');
var log = require('../util/McpLog.js');
var pageUtil = require('../util/PageUtil.js');
var mcpMgDb = require('../config/McpMgDb.js');

var PrintControl = function(){};

PrintControl.prototype.handle = function(headNode, bodyStr, userCb)
{
    var self = this;
    async.waterfall([
        //check login state
        function(cb){
            var stationTable = db.get("station");
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
    headNode.key = user.secretKey;
    var skip = 0;
    var limit = bodyNode.size;
    if(!limit)
    {
        limit = 10;
    }
    log.info("print_queen_" + user.code);
    var printQueen = mcpMgDb.get("print_queen_" + user.code);
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
                printQueen.remove({_id:{$lte:maxId}}, {}, function(err, data){
                    backBodyNode.pi = pageUtil.get(skip, limit, count);
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
    var ticketTable = db.get("tticket");
    ticketTable.find({orderId:orderId, status:prop.ticketStatus.waiting_print},
        {orderId:1, seq:1, termCode:1, gameCode:1, betTypeCode:1,
            playTypeCode:1, amount:1, multiple:1, price:1, numbers:1,
            termIndexDeadline:1, version:1})
        .toArray(function(err, data){
        var rst = [];
        async.each(data, function(ticket, callback) {
            ticketTable.update({id:ticket.id, version:ticket.version},
                {$set:{sysTakeTime:dateUtil.getCurTime(), status:prop.ticketStatus.take_away,
                    version:ticket.version+1}},
                {}, function(err, data){
                    if(!err)
                    {
                        if(data.updateCount == 1)
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

var printControl = new PrintControl();
module.exports = printControl;