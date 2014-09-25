var CronJob = require("cron").CronJob;
var async = require('async');
var moment = require("moment");
var db = require('./app/config/McpDataBase.js');
var prop = require('./app/config/Prop.js');
var dateUtil = require('./app/util/DateUtil.js');

function sleep(milliSecond) {
    var startTime = new Date().getTime();
    console.log(moment(startTime).format("YYYY-MM-DD HH:mm:ss"));
    while(new Date().getTime() <= milliSecond + startTime) {

    }
    console.log(moment(new Date()).format("YYYY-MM-DD HH:mm:ss"));
};

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
            console.error(err); // -> null
        }
        else
        {
            console.log(result); // -> 16
        }
    });
};

Scheduler.prototype.checkOpen = function()
{
    var self = this;
    var self = this;
    self.openJob = new CronJob('*/5 * * * * *', function () {
        console.log("open job..................");
        var conn = db.getConn();
        var termTable = db.get("term");
        async.waterfall([
            //find term to open
            function(cb)
            {
                conn.setAutoCommit(false);
                termTable.find({STATUS:1100}, {GAMECODE:1, CODE:1, NEXTCODE:1, VERSION:1}).toArray(function(err, data){
                    console.log(data);
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
            function(term, cb)
            {
                var gameTable = db.get("game");
                gameTable.update({CODE:'F01'}, {$set:{NAME:prop.kvs.name}}, {}, function(err, data){
                    cb(null, term);
                });
            },
            //update term status
            function(term, cb)
            {
                sleep(20000);
                termTable.update({ID:term.ID, VERSION:term.VERSION}, {$set:{STATUS:1200, VERSION:term.VERSION + 1}}, {}, function(err, data){
                    console.log(dateUtil.getLogTime(), data);
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
                sleep(20000);
                console.log(dateUtil.getLogTime() + "commit the update");
                conn.commit(function(){
                    cb(null, dateUtil.getLogTime() + term.CODE + " open success");
                });
            }
        ], function (err, result) {
            if(err)
            {
                console.error(err);
                conn.rollback(function(){});
            }
            else
            {
                console.log(result); // -> 16
            }
        });
    });
    self.openJob.start();
};

var sch = new Scheduler();
sch.start();