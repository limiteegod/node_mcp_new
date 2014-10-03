var mysql = require('mysql');
var prop = require('./Prop.js');

var McpPool = function(){
    var self = this;
};

McpPool.prototype.connect = function(cb)
{
    var self = this;
    var conn = mysql.createConnection(prop.mcpdb);
    conn.connect(function(err){
        self.conn = conn;
        cb(null);
    });
};

McpPool.prototype.getConn = function()
{
    var self = this;
    return self.conn;
};

var pool = new McpPool();
module.exports = pool;
