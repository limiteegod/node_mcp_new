var async = require('async');
var dc = require('../config/DbCenter.js');
var ec = require('../config/ErrCode.js');
var transaction = require('./Transaction.js');

var StationService = function(){};

StationService.prototype.printSuccess = function(ticket, cb)
{
    var self = this;

};

StationService.prototype.saleSuccess = function(ticket, cb)
{
    var self = this;
    var stationGameTable = db.get("stationgame");
    var stationTable = db.get("station");
    async.waterfall([
        //get station game
        function(cb)
        {
            stationGameTable.find({stationId:ticket.stationId, gameCode:ticket.gameCode},
                {pFactor:1}).toArray(function(err, data){
                    cb(null, data[0]);
                });
        },
        //sale station get the money
        function(sg, cb)
        {
            log.info(sg);
            var amount = (sg.rFactor/10000)*ticket.amount;
            var success = false;
            async.whilst(
                function() { return !success},
                function(whileCb) {
                    stationTable.find({id:user.id}, {version:1, balance:1}).toArray(function(err, data){
                        var user = data[0];
                        stationTable.update({id:user.id, version:user.version},
                            {$inc:{balance:amount}, $set:{version:user.version + 1}}, {}, function(err, data){
                                if(data.updateCount == 1)
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
};



/**
 * 渠道购买彩票，进行扣款
 * @param stationId
 * @param amount
 * @param cb
 */
StationService.prototype.buyLot = function(stationId, amount, cb)
{
    var self = this;
    var stationTable = dc.main.get("station");
    transaction.run(function(wCb){
        async.waterfall([
            //find the station(查看投注站是否存在)
            function(cb){
                stationTable.find({id:stationId}, {version:1, balance:1}).toArray(function(err, data){
                    if(err)
                    {
                        cb(ec.E9999);
                    }
                    else
                    {
                        if(data.length == 0)
                        {
                            cb(ec.E2035);
                        }
                        else
                        {
                            cb(null, data[0]);
                        }
                    }
                });
            },
            //查看用户的余额是否足够
            function(station, cb)
            {
                if(station.balance < amount)
                {
                    cb(ec.E1007);
                }
                else
                {
                    cb(null, station);
                }
            },
            //decrease the money(扣款)
            function(station, cb){
                stationTable.update({id:station.id, version:station.version},
                    {$inc:{balance:amount*(-1)}, $set:{version:station.version + 1}}, {}, function(err, data){
                        if(err)
                        {
                            cb(ec.E9999);
                        }
                        else
                        {
                            if(data.affectedRows == 1)
                            {
                                station.balance = station.balance + amount;
                                station.version++;
                                cb(ec.E0000, station);
                            }
                            else
                            {
                                cb(ec.E9999);
                            }
                        }
                    });
            }
        ], function (err, result) {
            wCb(err, result);
        });
    }, function(err, data){
        cb(err, data);
    });
};

StationService.prototype.money = function(stationId, amount, cb)
{
    var self = this;
    transaction.run(function(wCb){
        var stationTable = db.get("station");
        stationTable.find({id:stationId}, {version:1, balance:1}).toArray(function(err, data){
            if(err) throw errCode.E9999;
            var user = data[0];
            stationTable.update({id:user.id, version:user.version},
                {$inc:{balance:amount}, $set:{version:user.version + 1}}, {}, function(err, data){
                    if(data.updateCount == 1)
                    {
                        success = true;
                    }
                    wCb();
                });
        });
    }, function(err, data){

    });
};


var stationService = new StationService();
module.exports = stationService;