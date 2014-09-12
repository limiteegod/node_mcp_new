/*
var util = require('util');
spawn = require('child_process').spawn;
ls = spawn('du', ['-m', '/home/']);

var start = new Date();
ls.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
});

ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
});

ls.on('exit', function (code) {
    var end = new Date();
    console.log(end - start);
});*/


/*spawn = require('child_process').spawn;
ls = spawn('java', ['-version']);

var start = new Date();
ls.stdout.on('data', function (data) {
    console.log(data.toString("utf8"));
});

ls.stderr.on('data', function (data) {
    console.log(data.toString("utf8"));
});

ls.on('exit', function (code) {
    var end = new Date();
    console.log(end - start);
});*/

var p = require('procstreams');
var serviceName = 'mongodb';
var interval = 2000;
setInterval(function () {
    p("ps aux").data(function (err, stdout, stderr) {
        var isRunning = false;
        if(stdout)
        {
            var backStr = stdout.toString("utf8").trim();
            var lines = backStr.split("\n");
            for(var key in lines)
            {
                var line = lines[key];
                var lineArray = line.split(/\s+/);
                console.log(lineArray[10]);
                /*if(line.indexOf('/home/liming/app/mongodb/bin/mongod') > -1)
                {
                    isRunning = true;
                }*/
            }
        }
        /*if(isRunning)
        {
            console.log("mongodb is running");
        }
        else
        {
            console.log("mongodb is not running");
        }*/
    });
}, interval);


/*var p = require('procstreams');
var serviceName = 'mongodb';
var interval = 2000;
setInterval(function () {
    p("ps aux").pipe('grep ' + serviceName).data(function (err, stdout, stderr) {
        var isRunning = false;
        if(stdout)
        {
            var backStr = stdout.toString("utf8").trim();
            var lines = backStr.split("\n");
            for(var key in lines)
            {
                var line = lines[key];
                var lineArray = line.split(/\s+/);
                console.log(lineArray[10]);
                *//*if(line.indexOf('/home/liming/app/mongodb/bin/mongod') > -1)
                 {
                 isRunning = true;
                 }*//*
            }
        }
        if(isRunning)
        {
            console.log("mongodb is running");
        }
        else
        {
            console.log("mongodb is not running");
        }
    });
}, interval);*/



