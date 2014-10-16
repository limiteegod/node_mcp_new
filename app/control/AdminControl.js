var async = require('async');
var esut = require('easy_util');
var log = esut.log;
var digestUtil = esut.digestUtil;
var pageUtil = esut.pageUtil;
var stationStatus = require('../config/StationStatus.js');
var ac = require('../config/AccountConfig.js');
var dc = require('../config/DbCenter.js');
var ec = require('../config/ErrCode.js');
var prop = require('../config/Prop.js');
var digestService = require('../service/DigestService.js');
var stationService = require('../service/StationService.js');

var AdminControl = function(){
    var self = this;
    self.cmd = {'AD01':1, 'AD02':2, 'AD03':3, 'AD04':4, 'AD05':5, 'AD06':6,
    'AD07':7, 'AD08':8, 'AD09':9};
    self.cmdArray = [{}, {id:1, code:'AD01', fromType:prop.digestFromType.DB, des:"管理员登陆"},
        {id:2, code:'AD02', fromType:prop.digestFromType.CACHE, des:'获得权限菜单'},
        {id:3, code:'AD03', fromType:prop.digestFromType.CACHE, des:'添加投注站'},
        {id:4, code:'AD04', fromType:prop.digestFromType.CACHE, des:'修改投注站'},
        {id:5, code:'AD05', fromType:prop.digestFromType.CACHE, des:'添加期次'},
        {id:6, code:'AD06', fromType:prop.digestFromType.CACHE, des:'添加游戏'},
        {id:7, code:'AD07', fromType:prop.digestFromType.CACHE, des:'修改期次'},
        {id:8, code:'AD08', fromType:prop.digestFromType.CACHE, des:'修改机构游戏'},
        {id:9, code:'AD09', fromType:prop.digestFromType.CACHE, des:'账户操作'}];
};

AdminControl.prototype.handle = function(headNode, bodyStr, userCb)
{
    var self = this;
    async.waterfall([
        //是否是支持的cmd
        function(cb)
        {
            var cmd = self.cmd[headNode.cmd];
            if(cmd == undefined)
            {
                cb(ec.E9000);
            }
            else
            {
                cb(null);
            }
        },
        //校验头的用户类型是否合法
        function(cb)
        {
            var userTypeId = prop.userType[headNode.userType];
            if(userTypeId == undefined)
            {
                cb(ec.E9005);
            }
            else
            {
                cb(null, userTypeId);
            }
        },
        //获得密钥
        function(userTypeId, cb)
        {
            var cmd = self.cmdArray[self.cmd[headNode.cmd]];
            digestService.getKey({fromType:cmd.fromType, userId:headNode.userId, userType:userTypeId},
            function(err, key){
                cb(err, key);
            });
        },
        //先解密
        function(key, cb)
        {
            log.info(key);
            var decodedBodyStr = digestUtil.check(headNode, key, bodyStr);
            try {
                var bodyNode = JSON.parse(decodedBodyStr);
                headNode.key = key;
                cb(null, bodyNode);
            }
            catch (err)
            {
                cb(ec.E9003);
            }
        },
        //check the param
        function(bodyNode, cb){
            var method = 'check' + headNode.cmd;
            self[method](null, headNode, bodyNode, function(err){
                cb(err, bodyNode);
            });
        },
        //业务处理
        function(bodyNode, cb){
            var cmd = 'handle' + headNode.cmd;
            self[cmd](null, headNode, bodyNode, cb);
        }
    ], function (err, bodyNode) {
        userCb(err, bodyNode);
    });
};


AdminControl.prototype.checkAD01 = function(user, headNode, bodyNode, cb)
{
    cb(null);
};

AdminControl.prototype.checkAD02 = function(user, headNode, bodyNode, cb)
{
    cb(null);
};

AdminControl.prototype.checkAD03 = function(user, headNode, bodyNode, cb)
{
    cb(null);
};

AdminControl.prototype.checkAD04 = function(user, headNode, bodyNode, cb)
{
    cb(null);
};

AdminControl.prototype.checkAD05 = function(user, headNode, bodyNode, cb)
{
    cb(null);
};

AdminControl.prototype.checkAD06 = function(user, headNode, bodyNode, cb)
{
    cb(null);
};

AdminControl.prototype.checkAD07 = function(user, headNode, bodyNode, cb)
{
    cb(null);
};

AdminControl.prototype.checkAD08 = function(user, headNode, bodyNode, cb)
{
    cb(null);
};


AdminControl.prototype.checkAD09 = function(user, headNode, bodyNode, cb)
{
    cb(null);
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
    var stInfoTable = dc.mg.get("stInfo");
    stInfoTable.findOne({_id:headNode.userId}, {}, [], function(err, data){
        if(data)
        {
            var newSt = data.st;
            var now = new Date();
            if(now.getTime() - data.lastActiveTime > prop.loginExpiredSeconds*1000)
            {
                //expired
                newSt = digestUtil.createUUID();
            }
            stInfoTable.update({_id:headNode.userId}, {$set:{lastActiveTime:new Date().getTime(), st:newSt}},
            [], function(err, data){
                cb(null, {uniqueId:bodyNode.uniqueId, st:newSt});
            });
        }
        else
        {
            var st = digestUtil.createUUID();
            stInfoTable.save({_id:headNode.userId, st:st, lastActiveTime:new Date().getTime()}, [], function(err, data){
                cb(null, {uniqueId:bodyNode.uniqueId, st:st});
            });
        }
    });
};

/**
 * save area
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
    var operationTable = dc.main.get("operation");
    operationTable.find(cond, {}).toArray(function(err, data){
        if(data)
        {
            backBodyNode.rst = data;
        }
        cb(null, backBodyNode);
    });
};

/**
 * save area
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
AdminControl.prototype.handleAD03 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    var station = bodyNode.station;
    station.id = digestUtil.createUUID();
    station.balance = 0;
    station.queueIndex = -1;
    station.relayable = -1;
    station.status = stationStatus.OPEN;
    station.version = 0;
    var table = dc.main.get("station");
    table.save(station, [], function(err, data){
        if(err)
        {
            log.info(err);
            cb(ec.E0999);
        }
        else
        {
            cb(err, backBodyNode);
        }
    });
};

/**
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
AdminControl.prototype.handleAD04 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    var table = dc.main.get("station");
    table.update(bodyNode.cond, bodyNode.data, [], function(err, data){
        if(err)
        {
            log.info(err);
            cb(ec.E0999);
        }
        else
        {
            cb(err, backBodyNode);
        }
    });
};

/**
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
AdminControl.prototype.handleAD05 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    var term = bodyNode.term;
    term.id = digestUtil.createUUID();
    term.version = 0;
    var table = dc.main.get("term");
    table.save(term, [], function(err, data){
        if(err)
        {
            log.info(err);
            cb(ec.E0999);
        }
        else
        {
            cb(err, backBodyNode);
        }
    });
};

/**
 * 添加游戏
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
AdminControl.prototype.handleAD06 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    var game = bodyNode.game;
    game.id = digestUtil.createUUID();
    game.version = 0;
    game.offset = 0;
    game.isSynchro = 0;
    var table = dc.main.get("game");
    table.save(game, [], function(err, data){
        if(err)
        {
            log.info(err);
            cb(ec.E0999);
        }
        else
        {
            cb(err, backBodyNode);
        }
    });
};

/**
 * 修改期次
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
AdminControl.prototype.handleAD07 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    var table = dc.main.get("term");
    table.update(bodyNode.cond, bodyNode.data, [], function(err, data){
        if(err)
        {
            log.info(err);
            cb(ec.E0999);
        }
        else
        {
            cb(err, backBodyNode);
        }
    });
};

/**
 * 修改机构游戏
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
AdminControl.prototype.handleAD08 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    var table = dc.main.get("stationgame");
    table.update(bodyNode.cond, bodyNode.data, [], function(err, data){
        if(err)
        {
            log.info(err);
            cb(ec.E0999);
        }
        else
        {
            cb(err, backBodyNode);
        }
    });
};

/**
 * 账户操作
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
AdminControl.prototype.handleAD09 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    var subjectId = bodyNode.subjectId;
    var subject = ac.getInfoById(subjectId);
    var role = subjectId.substr(0, 2);
    var account = subjectId.substr(2, 2);
    var type = subjectId.substr(4, 1);
    var subjectDetailId = subjectId.substr(5, 4);
    var handlerCode = subjectId.substr(0, 7);
    var amount = bodyNode.amount;
    var orderId = bodyNode.orderId;
    var entityId = bodyNode.entityId;
    var timeStamp = new Date().getTime();
    var mlTable = dc.main.get("moneylog");
    var moneylog = {id:digestUtil.createUUID(), handlerCode:handlerCode, operationCode:subjectId,
    subject:subject.name, orderId:orderId, userId:'ADMIN', createTimeStamp:timeStamp,
    acceptTimeStamp:timeStamp, fromAccountCode:'', fromEntityId:'', amount:amount,
    toAccountCode:'', toEntityId:'', status:0};
    if(type == '1')
    {
        amount = amount*(-1);
    }
    //机构账户操作
    if(role == 'RS')
    {
        stationService.money({code:entityId}, amount, function(err, station){
            if(err)
            {
                cb(err);
            }
            else
            {
                moneylog.stateBefore = station.balance - amount;
                moneylog.stateAfter = station.balance;
                moneylog.fromEntityId = station.id;
                moneylog.toEntityId = station.id;
                mlTable.save(moneylog, [], function(err, data){
                    cb(err, backBodyNode);
                });
            }
        });
    }
    else if(role == 'RU')
    {
        cb(null, backBodyNode);
    }
};

var adminControl = new AdminControl();
module.exports = adminControl;