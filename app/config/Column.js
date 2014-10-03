var log = require('../util/McpLog.js');

var Column = function(db, name, type, length, nullable, default_value, primary, auto_increment){
    var self = this;
    self.db = db;
    self.name = name;
    self.type = type;
    self.length = length;
    if(default_value != undefined)
    {
        self.default_value = default_value;
    }
    if(nullable == undefined)
    {
        self.nullable = false;
    }
    else
    {
        self.nullable = nullable;
    }
    if(primary == undefined)
    {
        self.primary = false;
    }
    else
    {
        self.primary = primary;
    }
    if(auto_increment == undefined)
    {
        self.auto_increment = false;
    }
    else
    {
        self.auto_increment = auto_increment;
    }
};

Column.prototype.getName = function()
{
    var self = this;
    return self.name;
};

Column.prototype.getType = function()
{
    var self = this;
    return self.type;
};

Column.prototype.getLength = function()
{
    var self = this;
    return self.length;
};

Column.prototype.isNullable = function()
{
    var self = this;
    return self.nullable;
};

Column.prototype.isPrimary = function()
{
    var self = this;
    return self.primary;
};

Column.prototype.isAuto_increment = function()
{
    var self = this;
    return self.auto_increment;
};

Column.prototype.traverse = function()
{
    var self = this;
    var sql = self.toString();
    log.info(sql);
};

/**
 * 转换成创建列时的字符串
 */
Column.prototype.toString = function()
{
    var self = this;
    if(self.type == 'UNIQUE')
    {
        var sql = 'CONSTRAINT ' + self.name + " " + self.type + "(" + self.default_value + ")";
        return sql;
    }
    else
    {
        var sql = self.name + " " + self.type;
        if(self.type != 'date' && self.type != 'bigint' && self.type != 'datetime' && self.type != 'date')
        {
            sql += "(" + self.length + ")";
        }
        if(!self.nullable)
        {
            sql += " not null";
        }
        if(self.default_value != undefined)
        {
            sql += " default '" + self.default_value + "'";
        }
        if(self.primary)
        {
            sql += " primary key";
        }
        if(self.auto_increment)
        {
            sql += " auto_increment";
        }
        return sql;
    }
};

module.exports = Column;