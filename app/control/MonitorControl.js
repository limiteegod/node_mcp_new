var async = require('async');
var cmdFactory = require("./CmdFactory.js");
var digestUtil = require("../util/DigestUtil.js");

var MonitorControl = function(){};

MonitorControl.prototype.handle = function(headNode, bodyStr, userCb)
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
            self[cmd](headNode, bodyNode, cb);
        }
    ], function (err, headNode, backBodyNode) {
        userCb(err, headNode, backBodyNode);
    });
};

/**
 *
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
MonitorControl.prototype.handleMT01 = function(headNode, bodyNode, cb)
{
    cb(null, headNode, bodyNode);
};

module.exports = new MonitorControl();