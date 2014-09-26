var async = require('async');
var digestUtil = require("../util/DigestUtil.js");
var db = require('../config/McpDataBase.js');
var errCode = require('../config/ErrCode.js');
var prop = require('../config/Prop.js');
var loginControl = require('./LoginControl.js');
var log = require('../util/McpLog.js');
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
 * find one's all operations
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
PrintControl.prototype.handleP12 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    log.info("print_queen_" + user.code);
    var printQueen = mcpMgDb.get("print_queen_" + user.code);
    printQueen.find({}, {}).toArray(function(err, data){
        for(var key in data)
        {
            data[key].id = data[key]._id;
            data[key]._id = undefined;
        }
        backBodyNode.rst = data;
        headNode.key = user.secretKey;
        cb(null, backBodyNode);
    });
};

var printControl = new PrintControl();
module.exports = printControl;