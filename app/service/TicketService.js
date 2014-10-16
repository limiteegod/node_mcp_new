var dc = require('../config/DbCenter.js');
var ec = require('../config/ErrCode.js');

var TicketService = function(){};


/**
 * 出票系统出票成功的回执
 */
TicketService.prototype.printBack = function(ticket, cb)
{
    var self = this;
    var table = dc.main.get("tticket");
    var cond = {id:ticket.id, version:ticket.version};
    var data = {status:ticket.status, rNumber:ticket.rNumber,
    version:ticket.version+1};
    table.update(cond, {$set:data}, [], function(err, data){
        if(data.affectedRows == 1)
        {
            cb(null, ticket);
        }
        else
        {
            cb(ec.E3002, ticket);
        }
    });
};


module.exports = new TicketService();