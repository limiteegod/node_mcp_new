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

var Notify = function(){};

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
                    self.sendUntilEmpty(config);
                    callback();
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
Notify.prototype.sendUntilEmpty = function(config)
{
    var self = this;
    var colName = 'notify_queen_' + config._id;
    var table = dc.mg.getConn().collection(colName);
    async.waterfall([
        //从队列中取消息
        function(cb)
        {
            table.findAndRemove({}, {}, [], function(err, data){
                if(err)
                {
                    cb(err);
                    return;
                }
                if(!data)
                {
                    cb("no msg to send...");
                    return;
                }
                cb(null, data);
            });
        },
        //发送消息
        function(msgObj, cb)
        {
            var options = {
                hostname: config.notifyIp,
                port: config.notifyPort,
                path: config.notifyPath,
                method: 'POST'
            };
            self.sendMsg(options, msgObj.msg, 0, function(err, data){
                cb(err, data);
            });
        }
    ], function (err, result) {
        if(err)
        {
            log.info(err);
            if(err == ec.E4002)
            {
                self.sendUntilEmpty(config);
            }
        }
        else
        {
            self.sendUntilEmpty(config);
        }
    });
}

/**
 * 发送单个消息
 */
Notify.prototype.sendMsg = function(options, msg, tryCount, cb)
{
    var self = this;
    if(!options.hostname)
    {
        cb(ec.E4002);
        return;
    }
    log.info('第' + (tryCount + 1) + "次发送:");
    log.info(msg);
    notifyUtil.send(options, msg, function(err, data){
        if(err)
        {
            log.error(err);
            tryCount++;
            if(tryCount >= 3)
            {
                cb(err, data);
            }
            else
            {
                self.sendMsg(options, msg, tryCount, cb);
            }
        }
        else
        {
            log.info(data);
            cb(err, data);
        }
    });
}

var notify = new Notify();
notify.start();