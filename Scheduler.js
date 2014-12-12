var CronJob = require("cron").CronJob;
var async = require('async');
var moment = require("moment");


var dc = require('mcp_dao').dc;

var config = require('mcp_config');
var prop = config.prop;

var esut = require("easy_util");
var log = esut.log;
var dateUtil = esut.dateUtil;
var digestUtil = esut.digestUtil;

var job = require("mcp_job");

var Scheduler = function(){};

/**
 *
 */
Scheduler.prototype.start = function()
{
    var self = this;
    async.waterfall([
        function(cb)
        {
            dc.init(function(err){
                cb(err);
            });
        },
        //start web
        function(cb)
        {
            self.issueJob();
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

/**
 * 期次相关任务
 */
Scheduler.prototype.issueJob = function()
{
    var self = this;
    var games = ['F01'];
    //启动算奖任务
    new job.CheckJob(games);
}

/**
 * 校验是否有需要开售的期次
 */
Scheduler.prototype.checkOpen = function()
{
    var self = this;
    self.openJob = new CronJob('*/10 * * * * *', function () {
        log.info("open job..................");
        var termTable = dc.main.get("term");
        async.waterfall([
            //find term to open
            function(cb)
            {
                var now = dateUtil.toString(new Date());
                termTable.find({status:1100, openTime:{$lt:now}},
                    {gameCode:1, code:1, nextCode:1, version:1}).toArray(function(err, data){
                    log.info(data);
                    if(err) cb(err);
                    if(data.length == 0)
                    {
                        cb(new Error("no term to open."));
                    }
                    else
                    {
                        cb(null, data[0]);
                    }
                });
            },
            //update term status
            function(term, cb)
            {
                termTable.update({id:term.id, version:term.version}, {$set:{status:1200, version:term.version + 1}}, {}, function(err, data){
                    if(err) cb(err);
                    log.info(data);
                    if(data.length < 1)
                    {
                        cb("transaction failed");
                    }
                    cb(err, term);
                });
            },
            //commit the update
            function(term, cb)
            {
                cb(null, term.gameCode + "," + term.code + " open success");
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
    self.openJob.start();
};

var sch = new Scheduler();
sch.start();