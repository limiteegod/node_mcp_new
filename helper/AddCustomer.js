var async = require('async');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var log = esut.log;

var dao = require('mcp_dao');
var dc = dao.dc;

var config = require('mcp_config');
var prop = config.prop;

var run = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            var table = dc.main.get("customer");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("customer");
            table.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.main.get("customer");
            var admini = {id:digestUtil.createUUID(), name:"admin", password:"123456",
                type:0, version:0};
            table.save(admini, [], function(err, data){
                cb(err);
            });
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

run();
