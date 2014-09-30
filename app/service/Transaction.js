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
                    success = true;
                    whileCb();
                }
                else if(err != errCode.E9999)
                {
                    whileCb(err);
                }
                else
                {
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