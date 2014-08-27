var async = require('async');

var digestUtil = require("../util/DigestUtil.js");
var db = require('../config/Database.js');
var errCode = require('../config/ErrCode.js');
var prop = require('../config/Prop.js');
var uniqueIdService = require('../service/UniqueIdService.js');

var UserControl = function(){};

UserControl.prototype.handle = function(headNode, bodyStr, userCb)
{
    //用户登录
    if(headNode.cmd == "A01")
    {
        async.waterfall([
            //check user's name and userType exists or not
            function(cb){
                var userTable = db.get("user");
                userTable.find({name:headNode.userId, userTypeId:headNode.userType}, {name:1, password:1}).toArray(function(err, data)
                {
                    if(data.length == 0) //user not exists
                    {
                        userCb(errCode.E0002);
                    }
                    else
                    {
                        cb(null, data[0]);
                    }
                });
            },
            //generate bodyNode
            function(user, cb) {
                var password = user.password;
                var key = digestUtil.md5(password);
                var decodedBodyStr = digestUtil.check(headNode, key, bodyStr);
                try {
                    var bodyNode = JSON.parse(decodedBodyStr);
                    cb(null, key, bodyNode);
                }
                catch (err)
                {
                    userCb(errCode.E0003);
                }
            },
            //check uniqueId
            function(key, bodyNode, cb) {
                uniqueIdService.exists(bodyNode.uniqueId, function(err, data){
                    if(err)
                    {
                        userCb(errCode.E0004);
                    }
                    else
                    {
                        cb(null, key, bodyNode);
                    }
                });
            },
            //update st info
            function(key, bodyNode, cb) {
                headNode.key = key;
                var stInfoTable = db.get("stInfo");
                stInfoTable.find({_id:headNode.userId}, {lastActiveTime:1, st:1}).toArray(function(err, stInfoData){
                    if(stInfoData.length == 0)
                    {
                        var st = digestUtil.createUUID();
                        stInfoTable.save({_id:headNode.userId, st:st, lastActiveTime:new Date().getTime()});
                        cb(null, {uniqueId:bodyNode.uniqueId, st:st});
                    }
                    else
                    {
                        var newSt = stInfoData[0].st;
                        var now = new Date();
                        if(now.getTime() - stInfoData[0].lastActiveTime > prop.loginExpiredSeconds*1000)
                        {
                            //expired
                            newSt = digestUtil.createUUID();
                        }
                        stInfoTable.update({_id:headNode.userId}, {$set:{lastActiveTime:new Date().getTime(), st:newSt}});
                        cb(null, {uniqueId:bodyNode.uniqueId, st:newSt});
                    }
                });
            }
        ], function (err, backBodyNode) {
            userCb(err, backBodyNode);
        });
    }
    //user query
    else if(headNode.cmd == 'A02')
    {
        async.waterfall([
            //get st from stInfo
            function(cb){
                var stInfoTable = db.get("stInfo");
                stInfoTable.find({_id:headNode.userId}, {lastActiveTime:1, st:1}).toArray(function(err, stInfoData){
                    if(stInfoData.length == 0)
                    {
                        userCb(errCode.E0005);
                    }
                    else
                    {
                        var now = new Date();
                        if(now.getTime() - stInfoData[0].lastActiveTime > prop.loginExpiredSeconds*1000)
                        {
                            //expired
                            userCb(errCode.E0005);
                        }
                        else
                        {
                            cb(null, stInfoData[0].st);
                        }
                    }
                });
            },
            //check body
            function(key, cb){
                var decodedBodyStr = digestUtil.check(headNode, key, bodyStr);
                try {
                    var bodyNode = JSON.parse(decodedBodyStr);
                    cb(null, key, bodyNode);
                }
                catch (err)
                {
                    userCb(errCode.E0003);
                }
            },
            //check uniqueId
            function(key, bodyNode, cb) {
                uniqueIdService.exists(bodyNode.uniqueId, function(err, data){
                    if(err)
                    {
                        userCb(errCode.E0004);
                    }
                    else
                    {
                        cb(null, key, bodyNode);
                    }
                });
            },
            //update st info
            function(key, bodyNode, cb) {
                headNode.key = key;
                var stInfoTable = db.get("stInfo");
                stInfoTable.update({_id:headNode.userId}, {$set:{lastActiveTime:new Date().getTime()}});
                var userTable = db.get("user");
                userTable.find({name:headNode.userId, userTypeId:headNode.userType}, {name:1, password:1, userTypeId:1}).toArray(function(err, data)
                {
                    if(data.length == 0) //user not exists
                    {
                        userCb(errCode.E0002);
                    }
                    else
                    {
                        cb(null, {user:data[0]});
                    }
                });
            }
        ], function (err, backBodyNode) {
            userCb(err, backBodyNode);
        });
    }
};

var userControl = new UserControl();
module.exports = userControl;