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

var termCode = '2014146';
var nextTermCode = '2014147';

var handle = function(id, cb)
{
    var sTable = dc.main.get("schemezh");
    var oTable = dc.main.get("torder");
    var tTable = dc.main.get("tticket");
    async.waterfall([
        //find scheme
        function(cb)
        {
            var cond = {id:id};
            var cols = {
                finishedOrderCount:1, cancelOrderCount:1, orderCount:1, status:1, curTermCode:1
            };
            sTable.findOne(cond, cols, [], function(err, data){
                cb(err, data);
            });
        },
        //check status
        function(scheme, cb)
        {
            /*log.info(scheme);
            if(scheme.finishedOrderCount + scheme.cancelOrderCount >= scheme.orderCount)
            {
                scheme.status = schemeStatus.FINISHED;
            }
            else
            {
                scheme.finishedOrderCount++;
                scheme.curTermCode = nextTermCode;
            }
            var cond = {id:id};
            var data = {
                $set:{
                    status:scheme.status, finishedOrderCount:scheme.finishedOrderCount,
                    curTermCode:scheme.curTermCode
                }
            }
            sTable.update(cond, data, [], function(err, data){
                cb(err, scheme);
            });*/
            cb(null, scheme);
        },
        //check scheme status
        function(scheme, cb)
        {
            if(scheme.status == schemeStatus.FINISHED)
            {
                cb("方案已经完结................");
            }
            else
            {
                cb(null, scheme);
            }
        },
        //find the order
        function(scheme, cb)
        {
            var cond = {schemeId:scheme.id, termCode:termCode};
            oTable.findOne(cond, {}, [], function(err, data){
                if(err)
                {
                    cb(err, data);
                }
                else
                {
                    if(data)
                    {
                        cb(err, scheme, data);
                    }
                    else
                    {
                        cb("找不到上一期的订单");
                    }
                }
            });
        },
        //find the tickets
        function(scheme, order, cb)
        {
            var cond = {orderId:order.id};
            var cursor = tTable.find(cond, {}, []);
            cursor.toArray(function(err, data){
                cb(err, scheme, order, data);
            });
        },
        //create the new order and tickets
        function(scheme, order, tickets, cb)
        {
            delete order.printTime;
            delete order.takeAwayTime;

            var now = new Date();
            order.id = digestUtil.createUUID();
            order.acceptTime = now;
            order.createTime = now;
            order.bonus = 0;
            order.bonusBeforeTax = 0;
            order.finishedTicketCount = 0;
            order.printCount = 0;
            order.printFailCount = 0;
            order.status = orderStatus.waiting_print;
            order.termCode = nextTermCode;
            order.version = 0;

            for(var key in tickets)
            {
                var ticket = tickets[key];
                ticket.id = digestUtil.createUUID();
                ticket.termCode = nextTermCode;
                ticket.bonus = 0;
                ticket.bonusBeforeTax = 0;
                ticket.orderId = order.id;
                ticket.acceptTime = now;
                ticket.createTime = now;
                ticket.status = ticketStatus.waiting_print;
                ticket.receiptStatus = receiptStatus.NOT_TAKE_AWAY;
                ticket.version = 0;
                ticket.stubInfo = '';
                ticket.terminalId = '';
                ticket.finishedCount = 0;
                delete ticket.printTime;
                delete ticket.sysTakeTime;
            }
            cb(null, scheme, order, tickets);
        },
        //save the order
        function(scheme, order, tickets, cb)
        {
            log.info(order);
            oTable.save(order, [], function(err, data){
                cb(err, scheme, order, tickets);
            });
        },
        //save the tickets
        function(scheme, order, tickets, cb)
        {
            async.eachSeries(tickets, function(ticket, callback) {
                tTable.save(ticket, [], function(err, data){
                    callback(err);
                });
            }, function(err){
                cb(err, scheme, order, tickets);
            });
        },
        //find the pstation
        function(scheme, order, tickets, cb)
        {
            var stationTable = dc.main.get("station");
            stationTable.find({id:order.printStationId}, {code:1}).toArray(function(err, data){
                cb(null, scheme, order, tickets, data[0]);
            });
        },
        //send the print notify
        function(scheme, order, tickets, pstation, cb)
        {
            var printQueen = dc.mg.pool.getConn().conn.collection("print_queen_" + pstation.code);
            mgKvService.getPrintSeqId(function(err, data){
                printQueen.save({_id:data.value, orderId:order.id,
                    gameCode:order.gameCode, termCode:order.termCode}, [], function(err, data){
                    cb(err);
                });
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
        lineReader.eachLine('scheme.txt', function(line, last, callback) {
            var id = line;
            log.info(id);
            handle(id, function(err, data){
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

