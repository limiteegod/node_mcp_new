var async = require('async');
var errCode = require('../config/ErrCode.js');
var log = require('../util/McpLog.js');

var Transaction = function(){};

Transaction.prototype.run = function(mainCb, resultCb)
{
    var self = this;
    var success = false;
    var wdata = {};
    async.whilst(
        function() { return !success},
        function(whileCb) {
            mainCb(function(err, data){
                log.info("back call from outer............");
                wdata = data;
                if(err == errCode.E0000)
                {
                    log.info("back call 0000 from outer............");
                    success = true;
                    whileCb();
                }
                else if(err != errCode.E9999)
                {
                    log.info("back call **** from outer............");
                    whileCb(err);
                }
                else
                {
                    log.info("back call 9999 from outer............");
                    whileCb();
                }
            });
        },
        function(err) {
            resultCb(err, wdata);
        }
    );
};

var transaction = new Transaction();
module.exports = transaction;