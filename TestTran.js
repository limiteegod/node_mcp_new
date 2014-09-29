var async = require('async');
var transaction = require('./app/service/Transaction.js');
var log = require('./app/util/McpLog.js');
var errCode = require('./app/config/ErrCode.js');

var TestTran = function(){};

TestTran.prototype.run = function(){
    transaction.run(function(wCb){
        async.waterfall([
            //find the order
            function(cb){
                log.info("abc----------1");
                cb(null);
            },
            function(cb){
                log.info("abc----------2");
                cb(null);
            }
        ], function (err, result) {
            wCb(errCode.E0000, {a:1});
        });
    }, function(err, data){
        log.info(err);
        log.info(data);
    });
};

var tt = new TestTran();
tt.run();