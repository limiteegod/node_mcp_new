var async = require('async');

var db = require('../config/Database.js');
var errCode = require('../config/ErrCode.js');
var prop = require('../config/Prop.js');
var loginControl = require('./LoginControl.js');

var AdminControl = function(){};

AdminControl.prototype.handle = function(headNode, bodyStr, userCb)
{
    var self = this;
    async.waterfall([
        //check login state
        function(cb){
            loginControl.check(headNode, bodyStr, function(errCode, user, headNode, bodyNode){
                if(errCode)
                {
                    userCb(errCode);
                }
                else
                {
                    cb(null, user, headNode, bodyNode);
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
AdminControl.prototype.handleAD01 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    var cond = bodyNode.cond;
    if(cond == undefined)
    {
        cond = {};
    }
    cond.userTypeId = user.userTypeId;
    var userOperationTable = db.get("userOperation");
    var operationTable = db.get("operation");
    userOperationTable.find(cond, {userTypeId:1, operationId:1}).toArray(function(err, data){
        async.each(data, function(row, callback) {
            operationTable.find({_id:row.operationId}, {name:1, url:1, parentId:1}).toArray(function(err, data){
                row.operation = data[0];
                callback(err);
            });
        }, function(err){
            if(err) {
                cb(errCode.E9999);
            } else {
                backBodyNode.rst = data;
                cb(null, backBodyNode);
            }
        });
    });
};

/**
 * find operation by condition
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
AdminControl.prototype.handleAD02 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    var cond = bodyNode.cond;
    if(cond == undefined)
    {
        cond = {};
    }
    var operationTable = db.get("operation");
    operationTable.find(cond, {name:1, url:1, parentId:1, hasChildren:1}).toArray(function(err, data){
        backBodyNode.rst = data;
        cb(err, backBodyNode);
    });
};

var adminControl = new AdminControl();
module.exports = adminControl;