var async = require('async');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var dc = require('../config/DbCenter.js');

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

/**
 *
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
MonitorControl.prototype.handleMT02 = function(headNode, bodyNode, cb)
{
    var backBodyNode = {};
    backBodyNode.uniqueId = bodyNode.uniqueId;

    var machineTable = db.get("machine");
    machineTable.find({}, {ip:1, status:1}).toArray(function(err, data){
        if(err) throw err;
        backBodyNode.rst = data;
        cb(null, headNode, backBodyNode);
    });
};

module.exports = new MonitorControl();