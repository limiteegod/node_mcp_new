var async = require('async');
var prop = require('../config/Prop.js');
var db = require('../config/McpDataBase.js');
var errCode = require('../config/ErrCode.js');

var OrderService = function(){};

OrderService.prototype.incSuccessTicketCount = function(orderId, cb)
{
    var self = this;
    var orderTable = db.get("torder");
    var success = false;
    async.whilst(
        function() { return !success},
        function(whileCb) {
            async.waterfall([
                //find the order
                function(cb){
                    orderTable.find({id:orderId}, {}).toArray(function(err, data){
                        if(err) throw err;
                        if(data.length != 1)
                        {
                            cb(errCode.E2005);
                        }
                        else
                        {
                            cb(null, data[0]);
                        }
                    });
                },
                //check the status
                function(torder, cb){
                    if(torder.status != prop.orderStatus.waiting_print)
                    {
                        cb(errCode.E2057);
                    }
                    else
                    {
                        cb(null, torder);
                    }
                },
                //increase the ticketcount
                function(torder, cb)
                {
                    torder.printCount = torder.printCount + 1;
                    if(torder.printCount + torder.printFailCount >= torder.ticketCount)
                    {
                        if(torder.printFailCount > 0)
                        {
                            torder.status = prop.orderStatus.partial_success;
                        }
                        else
                        {
                            torder.status = prop.orderStatus.success;
                        }
                    }
                    orderTable.update({id:torder.id, version:torder.version},
                        {$inc:{printCount:torder.printCount}, $set:{status:torder.status}}, {}, function(err, data){
                        if(err) throw err;
                        if(data.updateCount == 1)
                        {
                            success = true;
                            cb(null, torder);
                        }
                        else
                        {
                            cb(null);
                        }
                    });
                }
            ], function (err, result) {
                if(err)
                {
                    if(err != errCode.E9999)    //err except E9999, to up callback
                    {
                        whileCb(err, result);
                    }
                    else
                    {
                        whileCb(null, result);
                    }
                }
                else
                {
                    whileCb(null, result);
                }
            });
        },
        function(err) {
            cb(err);
        }
    );
};

module.exports = new OrderService();
