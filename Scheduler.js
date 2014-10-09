var CronJob = require("cron").CronJob;
var async = require('async');
var moment = require("moment");
var dc = require('./app/config/DbCenter.js');
var prop = require('./app/config/Prop.js');
var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

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
            self.checkOpen();
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
                termTable.find({status:1100, openTime:{$lt:new Date()}},
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