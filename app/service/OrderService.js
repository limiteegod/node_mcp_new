var async = require('async');
var prop = require('../config/Prop.js');
var errCode = require('../config/ErrCode.js');
var transaction = require('./Transaction.js');
var dc = require('../config/DbCenter.js');

var OrderService = function(){};

OrderService.prototype.incSuccessTicketCount = function(orderId, cb)
{
    var self = this;
    var orderTable = dc.main.get("torder");
    transaction.run(function(wCb){
        async.waterfall([
            //find the order
            function(cb){
                orderTable.find({id:orderId}, {}).toArray(function(err, data){
                    if(err) throw errCode.E9999;
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
                    {$inc:{printCount:1}, $set:{status:torder.status}}, {}, function(err, data){
                        if(err) throw errCode.E9999;
                        if(data.updateCount == 1)
                        {
                            cb(errCode.E0000, torder);
                        }
                        else
                        {
                            cb(errCode.E9999);
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

module.exports = new OrderService();
