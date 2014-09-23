var async = require('async');
var cmdFactory = require("./CmdFactory.js");
var digestUtil = require("../util/DigestUtil.js");
var db = require('../config/Database.js');
var printMgDb = require('../config/PrintMgDb.js');

var MongoControl = function(){};

MongoControl.prototype.handle = function(headNode, bodyStr, userCb)
{
    var self = this;
    async.waterfall([
        //check login state
        function(cb){
            var bodyNode = JSON.parse(digestUtil.check(headNode, null, bodyStr));
            cb(null, headNode, bodyNode);
        },
        //check body
        function(headNode, bodyNode, cb){
            var cmd = 'handle' + headNode.cmd;
            self[cmd](null, headNode, bodyNode, cb);
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
MongoControl.prototype.handleMG01 = function(user, headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {};
    var col = printMgDb.get(bodyNode.id);
    col.drop(function(err, data){
        cb(null, backBodyNode);
    });
};

var mongoControl = new MongoControl();
module.exports = mongoControl;