var CronJob = require("cron").CronJob;
var async = require('async');
var moment = require("moment");

var dc = require('mcp_dao').dc;

var esut = require("easy_util");
var log = esut.log;
var dateUtil = esut.dateUtil;

var mcpUtil = require("mcp_util");
var notifyUtil = mcpUtil.notifyUtil;

var config = require('mcp_config');
var ec = config.ec;

var Notify = function(){
    var self = this;

    //模块内部错误码
    self.ec = {
        E0001:{code:"0001", description:'没有可发送的消息'},
        E0002:{code:"0002", description:'缺少通知配置'}
    };
};

/**
 *
 */
Notify.prototype.start = function()
{
    var self = this;
    async.waterfall([
        function(cb)
        {
            dc.init(function(err){
                cb(err);
            });
        },
        //start msg hanled
        function(cb)
        {
            self.sendNotify();
            cb(null, "success");
        }
    ], function (err, result) {
        if(err)
        {
            log.info(err); // -> null
        }
        else
        {
            log.info(result); // -> 16
        }
    });
};

Notify.prototype.sendNotify = function()
{
    var self = this;
    self.sendJob = new CronJob('*/10 * * * * *', function () {
        log.info("扫描通知的心跳信息.");
        async.waterfall([
            //查找所有的要发送通知的渠道
            function(cb)
            {
                var table = dc.mg.get("notify_channel_all");
                var cond = {status:{$gte:0}};
                var cursor = table.find(cond, {}, []);
                cursor.toArray(function(err, configs){
                    cb(err, configs);
                });
            },
            //每个渠道的通知队列，直到发送完为止
            function(configs, cb)
            {
                async.eachSeries(configs, function(config, callback) {
                    self.sendUntilEmpty(config, function(err, data){
                        if(err)
                        {
                            log.error(err);
                        }
                        callback();
                    });
                }, function(err){
                    cb(null, "finished...............");
                });
            }
        ], function (err, result) {
            log.info(err);
            log.info(result);
        });
    });
    self.sendJob.start();
}

/**
 * 发送消息，直到为空
 */
Notify.prototype.sendUntilEmpty = function(config, cb)
{
    var self = this;
    var colName = 'notify_queen_' + config._id;
    var table = dc.mg.getConn().collection(colName);

    var options = {
        hostname: config.notifyIp,
        port: config.notifyPort,
        path: config.notifyPath,
        method: 'POST'
    };

    async.waterfall([
        //校验是否有通知地址配置
        function(cb)
        {
            if(config.notifyIp)
            {
                cb(null);
            }
            else
            {
                cb(self.ec.E0002);
            }
        },
        //从队列中取消息，并进行发送
        function(cb)
        {
            var hasNext = true;
            async.whilst(
                function () { return hasNext;},
                function (callback) {
                    table.findAndRemove({}, {}, [], function(err, data){
                        if(err)
                        {
                            callback(err);
                            return;
                        }
                        if(data)
                        {
                            self.sendMsg(options, data.msg, function(err, data){
                                callback(err);
                            });
                        }
                        else
                        {
                            callback();
                            hasNext = false;
                        }
                    });
                },
                function (err) {
                    cb(err);
                }
            );
        }
    ], function (err, result) {
        cb(err, result);
    });
}

/**
 * 发送单个消息
 */
Notify.prototype.sendMsg = function(options, msg, cb)
{
    var self = this;
    var tryCount = 0;
    async.whilst(
        function () { return tryCount < 3;},
        function (callback) {
            var start = new Date().getTime();
            notifyUtil.send(options, msg, function(err, data){
                tryCount++;
                var end = new Date().getTime();
                var used = end - start;
                if(err)
                {
                    log.error(err);
                    log.error('第' + tryCount + "次发送消息失败,用时" + used + "ms.");
                    log.error(options);
                    log.error(msg);
                }
                else
                {
                    log.info('第' + tryCount + "次发送消息成功,用时" + used + "ms.");
                    log.info(options);
                    log.info(msg);
                    tryCount = 3;   //会结束循环
                }
                callback();
            });
        },
        function (err) {
            cb(err);
        }
    );
}

var notify = new Notify();
notify.start();