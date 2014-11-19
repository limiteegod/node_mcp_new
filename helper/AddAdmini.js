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
        function(cb)
        {
            var table = dc.main.get("admini");
            table.save({id:digestUtil.createUUID(), name:"admin", password:"123456"}, [], function(err, data){
                cb(err);
            });
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

run();
