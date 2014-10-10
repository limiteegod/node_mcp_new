var async = require('async');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var dateUtil = esut.dateUtil;
var ec = require('../config/ErrCode.js');
var prop = require('../config/Prop.js');
var log = esut.log;
var pageUtil = esut.pageUtil;
var dc = require('../config/DbCenter.js');
var digestService = require('../service/DigestService.js');

var StationControl = function(){
    var self = this;
    self.cmd = {'ST01':0, 'ST02':1, 'ST03':2, 'ST04':3};
    self.cmdArray = [{id:0, code:'ST01', fromType:prop.digestFromType.DB, des:""},
        {id:1, code:'ST02', fromType:prop.digestFromType.CACHE, des:''},
        {id:2, code:'ST03', fromType:prop.digestFromType.CACHE, des:''},
        {id:3, code:'ST04', fromType:prop.digestFromType.CACHE, des:''}];
};

StationControl.prototype.handle = function(headNode, bodyStr, userCb)
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
                cb(null);
            }
        },
        //获得密钥
        function(cb)
        {
            var cmd = self.cmdArray[self.cmd[headNode.cmd]];
            digestService.getKey({fromType:cmd.fromType, userId:headNode.userId, userType:headNode.userType},
            function(err, key){
                headNode.key = key;
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

/**
 *
 * @param user
 * @param headNode
 * @param bodyNode
 * @param cb
 */
StationControl.prototype.checkST01 = function(user, headNode, bodyNode, cb)
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
StationControl.prototype.handleST01 = function(user, headNode, bodyNode, cb)
{
    var backBodyNode = {};
    cb(null, backBodyNode);
};

var stationControl = new StationControl();
module.exports = stationControl;