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
        dc.main.clear(function(err){
            cb(err);
        });
    },
    function(cb){
        cb(null);
    }
], function (err, result) {
    log.info("end...........");
});

