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
            cb(null, null, headNode, bodyNode);
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
 *
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
MonitorControl.prototype.handleMT01 = function(user, headNode, bodyNode, cb)
{
    console.log(bodyNode);

    var backBodyNode = {};
    cb(null, backBodyNode);
};

module.exports = new MonitorControl();