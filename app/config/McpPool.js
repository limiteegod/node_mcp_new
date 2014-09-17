var mysql = require('mysql');
var prop = require('./Prop.js');

var conn = mysql.createConnection(prop.mcpdb);
conn.connect();

var McpPool = function(){
    var self = this;
};

McpPool.prototype.getConn = function()
{
    var self = this;
    return conn;
};

var pool = new McpPool();
module.exports = pool;
