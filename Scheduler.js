var CronJob = require("cron").CronJob;
var async = require('async');
var moment = require("moment");
var db = require('./app/config/McpDataBase.js');
var prop = require('./app/config/Prop.js');
var dateUtil = require('./app/util/DateUtil.js');
var log = require('./app/util/McpLog.js');

var Scheduler = function(){};

Scheduler.prototype.start = function()
{
    var self = this;
    async.waterfall([
        function(cb)
        {
            db.connect(function(err, conn){
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

Scheduler.prototype.checkOpen = function()
{
    var self = this;
    var self = this;
    self.openJob = new CronJob('*/5 * * * * *', function () {
        log.info("open job..................");
        var termTable = db.get("term");
        async.waterfall([
            //find term to open
            function(cb)
            {
                termTable.find({status:1100, openTime:{$lt:dateUtil.oracleToString(new Date())}},
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
                    log.info(dateUtil.getLogTime(), data);
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
                cb(null, dateUtil.getLogTime() + term.code + " open success");
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