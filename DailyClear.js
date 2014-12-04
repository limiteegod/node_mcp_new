var CronJob = require("cron").CronJob;
var async = require('async');

var esut = require("easy_util");
var log = esut.log;

var dc = require('mcp_dao').dc;

var moment = require("moment");

var config = require('mcp_config');
var prop = config.prop;

var fs = require('fs');

/**
 * 日结程序入口类，目前任务包括
 * 1.收集当天中奖票据，按如票渠道生成文件
 */
var DailyClear = function(cb)
{
    var self = this;
    self.cronTime = "0 5 0 * * *"; //日结触发的时间，cron表达式，凌晨5分触发
    //self.cronTime = "0 5 0 * * *";
    async.waterfall([
        function(cb)
        {
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            self.start();
            cb(null, "start success!");
        }
    ], function (err, result) {
        if(err)
        {
            log.info(err);
        }
        else
        {
            log.info(result);
        }
        if(cb)
        {
            cb(err, result);
        }
    });
}


DailyClear.prototype.start = function()
{
    var self = this;
    //先启动定时任务
    self.clearJob = new CronJob(self.cronTime, function () {
        async.waterfall([
            //按出票渠道生成文件
            function(cb)
            {
                self.collectTicket(function(err, data){
                    log.info("按出票渠道生成文件--------------------结果");
                    log.info(err);
                    log.info(data);
                    cb(err);
                });
            },
            //
            function(cb)
            {
                log.info("step 2...........");
                cb(null);
            },
            //
            function(cb)
            {
                log.info("step 3...........");
                cb(null);
            }
        ], function (err, result) {
            if(err)
            {
                log.info(err);
            }
            else
            {
                log.info(result); // -> 16
            }
        });
    });
    self.clearJob.start();
}

/**
 * 根据封存时间，收集上一天的中奖记录
 */
DailyClear.prototype.collectTicket = function(cb)
{
    var self = this;
    var region = self.getTimeRegion();
    async.waterfall([
        //先查找封存的期次信息
        function(cb)
        {
            self.getSealInfo(region, function(err, data){
                cb(err, data);
            });
        },
        //从mg缓存中，获取数据，保存到cache中
        function(sInfos, cb)
        {
            async.eachSeries(sInfos, function(sInfo, callback) {
                self.collectOneTerm(sInfo, function(err, data){
                    callback(err);
                });
            }, function(err){
                cb(err);
            });
        },
        //保存到文件
        function(cb)
        {
            self.saveToFile(function(err, data){
                cb(err, null);
            });
        }
    ], function (err, result) {
        cb(err, result);
    });
}

/**
 * 按出票渠道保存文件
 */
DailyClear.prototype.saveToFile = function(cb)
{
    var self = this;
    var mo = moment(new Date());
    var suffix = mo.format("_YYYY_MM_DD");
    var targetColName = "ticket_cache" + suffix;
    var targetConn = dc.cache.getConn();
    var targetTable = targetConn.collection(targetColName);
    var hasNext = true;
    var channelFileToSave = {};
    async.whilst(
        function () { return hasNext;},
        function (callback) {
            targetTable.findAndRemove({}, {}, [], function(err, ticket){
                if(err)
                {
                    callback(err);
                    return;
                }
                if(ticket)
                {
                    ticket.id = ticket._id;
                    delete ticket._id;
                    var line = JSON.stringify(ticket) + "\r\n";
                    var name = ticket.printStationId;
                    var content = channelFileToSave[name];
                    if(content == undefined)
                    {
                        content = '';
                    }
                    content += line;
                    if(content.length >= 40000) //大于缓存大小，先写入文件
                    {
                        self.writeToFile(name, suffix, content, function(err, data){
                            channelFileToSave[name] = '';
                            callback();
                        });
                    }
                    else
                    {
                        channelFileToSave[name] = content;
                        callback();
                    }
                }
                else
                {
                    hasNext = false;
                    callback();
                }
            });
        },
        function (err) {
            if(err)
            {
                cb(err, null);
            }
            else
            {
                //把剩下的内容保存到文件
                var rst = [];
                for(var key in channelFileToSave)
                {
                    var obj = {name:key, value:channelFileToSave[key]};
                    if(obj.value.length > 0)
                    {
                        rst[rst.length] = obj;
                    }
                }
                async.eachSeries(rst, function(channel, callback) {
                    self.writeToFile(channel.name, suffix, channel.value, function(err, data){
                        callback();
                    });
                }, function(err){
                    targetTable.drop(function(err, data){
                        log.info("删除完成的临时记录表:" + targetColName);
                        cb(null, null);
                    });
                });
            }
        }
    );
}

/**
 * 把文件内容写入字符串
 */
DailyClear.prototype.writeToFile = function(name, suffix, content, cb)
{
    var self = this;
    var dir = prop.cacheDir + "/" + name;
    if(!fs.existsSync(dir))
    {
        fs.mkdirSync(dir);
    }
    var name = dir + "/print" + suffix + ".txt";
    fs.appendFile(name, content, function (err) {
        if(err)
        {
            log.info("保存文件出现错误!");
            log.info(err);
        }
        cb(err, null);
    });
}

/**
 * 收集一期的中奖数据
 * @param sInfo
 * @param cb
 */
DailyClear.prototype.collectOneTerm = function(sInfo, cb)
{
    var self = this;
    var colName = 'check_ticket_' + sInfo.gameCode + "_" + sInfo.termCode;
    var conn = dc.mg.getConn();
    var table = conn.collection(colName);
    var mo = moment(new Date());
    var suffix = mo.format("_YYYY_MM_DD");
    var targetColName = "ticket_cache" + suffix;
    var targetConn = dc.cache.getConn();
    var targetTable = targetConn.collection(targetColName);
    var hasNext = true;
    async.whilst(
        function () { return hasNext;},
        function (callback) {
            table.findAndRemove({}, {}, [], function(err, ticket){
                if(err)
                {
                    callback(err);
                    return;
                }
                if(ticket)
                {
                    ticket.gameCode = sInfo.gameCode;
                    ticket.termCode = sInfo.termCode;
                    targetTable.save(ticket, [], function(err, data){
                        callback(err);
                    });
                }
                else
                {
                    hasNext = false;
                    callback();
                }
            });
        },
        function (err) {
            if(err)
            {
                cb(err, null);

            }
            else
            {
                table.drop(function(err, data){
                    log.info("删除完成的临时记录表:" + colName);
                    cb(null, null);
                });
            }
        }
    );
}

/**
 * 获取时间区间中封存的期次，规则为 region.start=<sTime<region.end
 * @param region
 */
DailyClear.prototype.getSealInfo = function(region, cb)
{
    var self = this;
    var cond = {sTime:{$lt:new Date(region.end), $gte:new Date(region.start)}};
    var table = dc.mg.get("term_seal_info");
    var cursor = table.find(cond, {});
    cursor.toArray(function(err, data){
        cb(err, data);
    });
}

/**
 * 获得当天的开始时间
 */
DailyClear.prototype.getTodayStartTime = function()
{
    var self = this;
    var mo = moment(new Date());
    var suffix = mo.format("YYYY-MM-DD");
    var str = suffix + 'T00:00:00.000+0800';
    var startMo = moment(str, "YYYY-MM-DDTHH:mm:ss.SSSZZ");
    return startMo.valueOf();
}


DailyClear.prototype.getTimeRegion = function()
{
    var self = this;
    //var start = self.getTodayStartTime();
    //var end = start + 24*60*60*1000;
    var end = self.getTodayStartTime();
    var start = end - 24*60*60*1000;
    return {start:start, end:end};
}

new DailyClear();

