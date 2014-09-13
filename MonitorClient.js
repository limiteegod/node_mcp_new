var async = require('async');
var db = require('./app/config/Database.js');
var osUtil = require('./app/util/OsUtil.js');
var digestUtil = require('./app/util/DigestUtil.js');
var CronJob = require("cron").CronJob;
var net = require('net');

var MonitorClient = function(){
    var self = this;
    self.monitorIndex = 0;
};

MonitorClient.prototype.start = function()
{
    var self = this;
    var ip = osUtil.getLocaleIp();
    var machineTable = db.get("machine");
    async.waterfall([
        //check if machine is registered or not
        function(cb){
            machineTable.find({ip:ip}, {ip:1}).toArray(function(err, data){
                if(err) throw err;
                var target = null;
                for(var index in data) {
                    if (data[index]._id != "server")
                    {
                        target = data[index];
                        break;
                    }
                }
                if(target)
                {
                    cb(null, target);
                }
                else
                {
                    cb(new Error("machine " + ip + " not registered."));
                }
            });
        },
        //find the proc to monitor
        function(machine, cb){
            var proInfoTable = db.get("proInfo");
            proInfoTable.find({machineId:machine._id}, {status:1, machineId:1, proc:1}).toArray(function(err, data){
                if(err) cb(err);
                cb(null, data);
            });
        },
        //connect to server
        function(procs, cb){
            self.startSocket(function(err){
                cb(err, procs);
            });
        },
        //start job to monitor the procs
        function(procs, cb){
            self.startCronJob(procs);
            cb(null);
        }
    ], function (err, result) {
        console.log('err: ', err); // -> null
        console.log('result: ', result); // -> 16
    });
};

/**
 *  start socket
 **/
MonitorClient.prototype.startSocket = function(cb)
{
    var self = this;
    var machineTable = db.get("machine");
    machineTable.find({_id:"server"}, {ip:1}).toArray(function(err, data){
        if(err) throw err;
        if(data.length > 0)
        {
            var ip = data[0].ip;
            self.socket = new net.Socket();

            self.socket.connect(9081, ip, function() {
                cb(null);
            });

            self.socket.on('data', function(data) {
                console.log('DATA: ' + data);
            });

            self.socket.on('close', function() {
                console.log('Connection closed');
                self.socket.destroy();
            });

            self.socket.on('error', function() {
                cb(new Error("cann't connect to " + ip));
            });
        }
        else
        {
            console.log("machine not found.");
        }
    });
};

//start cron job to monitor the procs
MonitorClient.prototype.startCronJob = function(procs)
{
    var self = this;
    console.log(procs);
    self.jobid = new CronJob('*/5 * * * * *', function () {
        var proc = procs[self.monitorIndex%procs.length];
        osUtil.getProcessInfo(proc.proc, function(data){
            var status = 0;
            if(data)
            {
                status = 1;
                console.log(proc.proc + " is running!");
            }
            else
            {
                console.log(proc.proc + " is not running!");
            }

            var bodyNode = {proc:proc.proc, status:status};
            self.sendBodyNode(bodyNode);
        });
        self.monitorIndex++;
    }, null, false, 'Asia/Shanghai');
    self.jobid.start();
};

/**
 *
 * @param bodyNode
 */
MonitorClient.prototype.sendBodyNode = function(bodyNode)
{
    var self = this;
    var headNode = {digestType:"3des-empty", cmd:"MT01"};
    var decodedBodyStr = digestUtil.generate(headNode, null, JSON.stringify(bodyNode));
    var msgNode = {head:headNode, body:decodedBodyStr};
    var msgStr = JSON.stringify(msgNode);
    var buf = new Buffer(msgStr);
    self.sendBuf(buf);
};

/**
 * send buf to server
 * @param buf
 */
MonitorClient.prototype.sendBuf = function(buf)
{
    var self = this;
    //send length
    var packageLength = buf.length;
    var packageLengthBuf = new Buffer(4);
    packageLengthBuf.writeInt32BE(packageLength, 0);
    self.socket.write(packageLengthBuf);
    //send data
    self.socket.write(buf);
};

var client = new MonitorClient();
client.start();