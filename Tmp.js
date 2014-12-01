var async = require('async');
var esut = require('easy_util');


var dc = require('mcp_dao').dc;
var log = esut.log;

var addAccount = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.main.get("station");
            table.update({code:"Q0003"}, {$set:{balance:10000000000}}, [], function(err, data){
                cb(err, "success");
            });
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

addAccount();
