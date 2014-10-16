var async = require('async');
var ticketStatus = require('../config/TicketStatus.js');
var orderService = require('../service/OrderService.js');
var ticketService = require('../service/TicketService.js');
var stationService = require('../service/StationService.js');
var ec = require('../config/ErrCode.js');
var dc = require('../config/DbCenter.js');

var TicketHelper = function(){};


/**
 * 出票成功
 */
TicketHelper.prototype.printSuccess = function(ticket)
{
    var self = this;
    //校验票据状态是否是打印成功
    if(ticket.status != ticketStatus.print_success)
    {
        cb(ec.E3004);
        return;
    }
    async.waterfall([
        //如果打印成功，则出票机构获得出票提成
        function(ticket, cb)
        {
            stationService.printSuccess(ticket, function(err, station){
                cb(err, ticket, station);
            });
        },
        //记录账户操作流水
        function(ticket, station, cb)
        {
            var table = dc.main.get("moneylog");
            var data = {};
        },
        //增加订单出票成功的票据数目
        function(ticket, station, cb)
        {
            orderService.incSuccessTicketCount(ticket.orderId, function(err, order){
                cb(null, ticket, success);
            });
        },
        //sale station get the sale percentage
        function(ticket, success, cb)
        {
            if(success)
            {
                var stationGameTable = dc.main.get("stationgame");
                var stationTable = dc.main.get("station");
                async.waterfall([
                    //get station game
                    function(cb)
                    {
                        stationGameTable.find({stationId:user.id, gameCode:ticket.gameCode},
                            {pFactor:1}).toArray(function(err, data){
                                cb(null, data[0]);
                            });
                    },
                    //print station get the money
                    function(sg, cb)
                    {
                        log.info(sg);
                        var amount = (sg.pFactor/10000)*ticket.amount;
                        var success = false;
                        async.whilst(
                            function() { return !success},
                            function(whileCb) {
                                stationTable.find({id:user.id}, {version:1, balance:1}).toArray(function(err, data){
                                    var user = data[0];
                                    stationTable.update({id:user.id, version:user.version},
                                        {$inc:{balance:amount}, $set:{version:user.version + 1}}, {}, function(err, data){
                                            if(data.affectedRows == 1)
                                            {
                                                success = true;
                                            }
                                            whileCb();
                                        });
                                });
                            },
                            function(err) {
                                cb(null);
                            }
                        );
                    },
                    //sale station get the money.
                    function(cb)
                    {
                        cb(null);
                    }
                ], function(err) {
                    cb(null, ticket, success);
                });
            }
            else
            {
                cb(null, ticket, success);
            }
        }
    ], function (err) {
        outerCb(err, backBodyNode);
    });
};


module.exports = new TicketHelper();