var dbPool = require('./DbPool.js');
var dateUtil = require('../util/DateUtil.js');
var log = require('../util/McpLog.js');

var DbCurser = function(table, options, baseSql){
    var self = this;
    self.table = table;
    self.baseSql = baseSql;
    self.options = options;
};

DbCurser.prototype.limit = function(start, size)
{
    var self = this;
    var sql = " limit " + start + "," + size;
    self.baseSql += sql;
    return self;
};

DbCurser.prototype.sort = function(data)
{
    var self = this;
    var count = 0;
    var sql = " order by ";
    for(var key in data)
    {
        if(count > 0)
        {
            sql += ",";
        }
        if(data[key] > 0)
        {
            sql += key;
        }
        else
        {
            sql += key + " desc";
        }
        count++;
    }
    if(count > 0)
    {
        self.baseSql += sql;
    }
};

DbCurser.prototype.toArray = function(cb)
{
    var self = this;
    log.info(self.baseSql);
    var conn = self.table.db.pool.getConn();
    conn.execute(self.baseSql, self.options, function(err, data){
        cb(err, data);
    });
};

module.exports = DbCurser;