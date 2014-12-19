var lineReader = require('line-reader');

var async = require('async');

var dc = require('mcp_dao').dc;

var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;
var dateUtil = esut.dateUtil;

var cons = require('mcp_cons');
var schemeStatus = cons.schemeStatus;
var orderStatus = cons.orderStatus;
var receiptStatus = cons.receiptStatus;
var ticketStatus = cons.ticketStatus;

var service = require('mcp_service');
var mgKvService = service.kvSer;

var handle = function(id, cb)
{
    var collection = dc.mg.pool.getConn().conn.collection("prize_order_prized_F01_2014147");
    async.waterfall([
        //find scheme
        function(cb)
        {
            collection.save(id, [], function(err, data){
                cb(err);
            });
        }
    ], function (err, rst) {
        log.info(id + ",处理结果:");
        log.info(err);
        log.info(rst);
        cb(null, "ok-------------------");
    });
}

async.waterfall([
    function(cb)
    {
        dc.init(function(err){
            cb(err);
        });
    },
    //start web
    function(cb)
    {
        lineReader.eachLine('/data/app/lorder.txt', function(line, last, callback) {
            var strArray = line.split(',');
            var obj = {
                _id:strArray[0],
                customerId:strArray[1],
                stationId:strArray[2],
                type:parseInt(strArray[3]),
                bonus:parseInt(strArray[4]),
                schemeType:parseInt(strArray[5])
            }
            log.info(obj);
            handle(obj, function(err, data){
                if (last) {
                    callback(false); // stop reading
                }
                else
                {
                    callback();
                }
            });
        }).then(function () {
            cb(null, "finished--------------------------");
        });
    }
], function (err, rst) {
    log.info("执行结果---------------");
    log.info(err);
    log.info(rst);
});

