var oracle = require('oracle');
var prop = require('./Prop.js');

var McpPool = function(){
    var self = this;
};

McpPool.prototype.connect = function(cb)
{
    var self = this;
    oracle.connect(prop.oracle, function(err, connection) {
        self.conn = connection;
        cb(err, connection);
    });
};

McpPool.prototype.getConn = function()
{
    var self = this;
    return self.conn;
};

var pool = new McpPool();
module.exports = pool;
