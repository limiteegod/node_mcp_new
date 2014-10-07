var dc = require('../config/DbCenter.js');

var MgKvService = function(){};

MgKvService.prototype.getPrintSeqId = function(cb)
{
    var kvTable = dc.mg.get("mcp_id");
    kvTable.findAndModify({_id:"print_seq"}, {}, {$inc:{value:1}}, {}, function(err, data){
        cb(err, data);
    });
};

module.exports = new MgKvService();