var log = require('./app/util/McpLog.js');
var dc = require('./app/config/DbCenter.js');
var async = require('async');

async.waterfall([
    //connect to the db
    function(cb){
        dc.init(function(err){
            cb(err);
        });
    },
    function(cb){
        var testTable = dc.mg.get("test");
        testTable.drop(function(err){
            cb(err);
        });
    },
    function(cb){
        var testTable = dc.mg.get("test");
        testTable.create(function(err){
            cb(err);
        });
    },
    function(cb){
        var testTable = dc.mg.get("test");
        testTable.save({_id:"123"}, [], function(err, data){
            log.info(data);
            cb(err);
        });
    },
    function(cb){
        var testTable = dc.mg.get("test");
        testTable.find({}, {}).toArray(function(err, data){
            log.info(data);
            cb(err, data);
        });
    }
], function (err, result) {
    log.info("end...........");
});

