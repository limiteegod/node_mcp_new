var Column = require('./Column.js');
var Table = require('./Table.js');
var DbPool = require('./DbPool.js');
var prop = require('./Prop.js');
var log = require('../util/McpLog.js');
var async = require('async');

var Database = function(index)
{
    var self = this;
    self.tables = [];
    self.tablesByName = {};
    self.index = index;
    self._initConfigFromIndex(index);
};

Database.prototype._initConfigFromIndex = function(index)
{
    var self = this;
    var config = prop.dbs[index];
    for(var key in config)
    {
        self[key] = config[key];
    }
};

Database.prototype.init = function(cb)
{
    var self = this;
    self.pool = new DbPool(self);
    self.pool.connect(cb);
};

Database.prototype.traverse = function()
{
    var self = this;
    log.info("----------------database:" + self.index + ":" + prop.getEnumById("dbTypeArray", self.type).code + "----------------");
    log.info(self.config);
    for(var key in self.tables)
    {
        var table = self.tables[key];
        table.traverse();
    }
};

/**
 * 清除数据库的所有表
 * @param cb
 */
Database.prototype.drop = function(cb)
{
    var self = this;
    async.each(self.tables, function(table, callback) {
        table.drop(function(err, data){
            if(err)
            {
                log.info("table " + table.name + " may not exists.")
            }
            callback();
        });
    }, function(err){
        cb(err);
    });
};

/**
 * 创建所有的表
 * @param cb
 */
Database.prototype.create = function(cb)
{
    var self = this;
    async.each(self.tables, function(table, callback) {
        table.create(function(err, data){
            callback();
        });
    }, function(err){
        cb(err);
    });
};

Database.prototype.put = function(table)
{
    var self = this;
    self.tables[self.tables.length] = table;
    self.tablesByName[table.name] = table;
};

Database.prototype.get = function(name)
{
    var self = this;
    var table = self.tablesByName[name];
    if(self.type == prop.dbType.mongodb)
    {
        table.col = self.pool.getConn().conn.collection(name, []);
    }
    return table;
};

module.exports = Database;




