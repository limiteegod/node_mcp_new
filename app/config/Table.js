var dbPool = require('./DbPool.js');
var DbCursor = require('./DbCursor.js');
var prop = require('./Prop.js');
var dateUtil = require('../util/DateUtil.js');
var log = require('../util/McpLog.js');

var Table = function(db, name, colList){
    var self = this;
    self.db = db;
    self.name = name;
    self.colList = new Array();
    for(var key in colList)
    {
        var col = colList[key];
        if(self.db.type == prop.dbType.oracle)
        {
            self.colList[col.getName().toUpperCase()] = col;
        }
        else
        {
            self.colList[col.getName()] = col;
        }
    }
};

Table.prototype.traverse = function()
{
    var self = this;
    log.info("----------------table:" + self.name + "----------------");
    for(var key in self.colList)
    {
        var col = self.colList[key];
        col.traverse();
    }
};

Table.prototype.getDb = function()
{
    var self = this;
    return self.db;
};

/**
 * 获得建表的ddl语言
 */
Table.prototype.getDdl = function()
{
    var self = this;
    var sql = "create table " + self.name + "(";
    var colList = self.colList;
    var i = 0;
    for(var key in colList)
    {
        var col = colList[key];
        if(i > 0)
        {
            sql += ",";
        }
        sql += col.toString();
        i++;
    }
    sql += ");";
    return sql;
};

/**
 * 获得表的名称
 * @returns {*}
 */
Table.prototype.getName = function()
{
    var self = this;
    return self.name;
};

/**
 * 删除表
 */
Table.prototype.drop = function(cb)
{
    var self = this;
    if(self.db.type == prop.dbType.mysql || self.db.type == prop.dbType.oracle)
    {
        var dropSql = "drop table " + self.name;
        log.info(dropSql);
        var conn = self.db.pool.getConn();
        conn.execute(dropSql, [], cb);
    }
    else if(self.db.type == prop.dbType.mongodb)
    {
        var conn = self.db.pool.getConn().conn;
        conn.dropCollection(self.name, cb);
    }
};

/**
 * 创建表
 * @param cb
 */
Table.prototype.create = function(cb)
{
    var self = this;
    if(self.db.type == prop.dbType.mysql || self.db.type == prop.dbType.oracle)
    {
        var sql = self.getDdl();
        var conn = self.db.pool.getConn();
        conn.execute(sql, [], cb);
    }
    else if(self.db.type == prop.dbType.mongodb)
    {
        var conn = self.db.pool.getConn().conn;
        conn.createCollection(self.name, [], cb);
    }
};

/**
 * 查找单条记录
 * @param condition
 * @param options
 * @param cb
 */
Table.prototype.findOne = function(condition, options, cb)
{
    var self = this;
    if(self.db.type == prop.dbType.mongodb)
    {
        self.col.findOne(condition, options, cb);
    }
};

Table.prototype.findAndModify = function(query, sort, doc, options, cb)
{
    var self = this;
    if(self.db.type == prop.dbType.mongodb)
    {
        self.col.findAndModify(query, sort, doc, options, cb);
    }
};

/**
 * 保存对象
 * @param cb
 */
Table.prototype.save = function(data, options, cb)
{
    var self = this;
    if(self.db.type == prop.dbType.mongodb)
    {
        self.col.save(data, options, cb);
    }
    else
    {
        var sql = "insert into " + self.name + "(";
        var keyStr = '';
        var valueStr = '';
        var i = 0;
        for(var key in data)
        {
            //如果没有相关的列，则直接忽略
            var col = self.colList[key];
            if(col == undefined)
            {
                continue;
            }
            if(i > 0)
            {
                keyStr += ",";
                valueStr += ",";
            }
            keyStr += key;
            var value = data[key];
            if(typeof value == "string")
            {
                valueStr += "'" + value + "'";
            }
            else if(typeof value == 'object')
            {
                if(col.type == 'date')
                {
                    if(self.db.type == prop.dbType.oracle)
                    {
                        valueStr += "to_date('" + dateUtil.toString(value) + "', 'yyyy-MM-dd HH24:mi:ss')";
                    }
                    else if(self.db.type == prop.dbType.mysql)
                    {
                        valueStr += "'" + dateUtil.toString(value) + "'";
                    }
                    else
                    {
                        valueStr += "'" + value + "'";
                    }
                }
                else
                {
                    valueStr += "'" + value + "'";
                }
            }
            else
            {
                valueStr += value;
            }
            i++;
        }
        sql += keyStr + ") values(" + valueStr + ")";
        log.info(sql);
        var conn = self.db.pool.getConn();
        conn.execute(sql, options, function(err, data){
            cb(err, data);
        });
    }
};

/**
 * get update string by json data object.
 * @param data
 * @returns {string}
 */
Table.prototype.getUpdateStr = function(data)
{
    var self = this;
    var pStr = "";
    var kCount = 0;
    for(var key in data) {
        var keyArray = key.match(/\$([a-z]+)/);
        if (keyArray)
        {
            if (keyArray[1] == 'set')
            {
                var setData = data[key];
                for(var setKey in setData)
                {
                    var col = self.colList[setKey];
                    if(col == undefined)
                    {
                        //如果没有相关的列，则直接忽略
                        continue;
                    }
                    else
                    {
                        if(kCount > 0)
                        {
                            pStr += ",";
                        }
                        pStr += self.getKvPair(setKey, "=", setData[setKey]);
                        kCount++;
                    }
                }
            }
            else if(keyArray[1] == 'inc')
            {
                var setData = data[key];
                for(var setKey in setData)
                {
                    var col = self.colList[setKey];
                    if(col == undefined)
                    {
                        //如果没有相关的列，则直接忽略
                        continue;
                    }
                    else
                    {
                        if(kCount > 0)
                        {
                            pStr += ",";
                        }
                        pStr += setKey + "=" + setKey;
                        if(setData[setKey] > 0)
                        {
                            pStr += "+";
                        }
                        pStr += setData[setKey];
                        kCount++;
                    }
                }
            }
        }
    }
    return pStr;
};

/**
 * excute update operation
 */
Table.prototype.update = function(condition, data, option, cb)
{
    var self = this;
    if(self.db.type == prop.dbType.mongodb)
    {
        self.col.update(condition, data, option, cb);
    }
    else
    {
        var sql = "update " + self.name + " set ";
        sql += self.getUpdateStr(data);
        var conditionStr = self.condition(condition);
        if(conditionStr.length > 0)
        {
            sql += " where " + conditionStr;
        }
        log.info(sql);
        var conn = self.db.pool.getConn();
        conn.execute(sql, option, function(err, data){
            if(data)
            {
                if(self.db.type == prop.dbType.oracle)
                {
                    data.affectedRows = data.updateCount;
                }
            }
            cb(err, data);
        });
    }
};

/**
 * 根据json格式的数据生成查询条件
 * @param data
 */
Table.prototype.condition = function(data, parentKey)
{
    var self = this;
    var conditionStr = "";
    var i = 0;
    for(var key in data) {
        if (i > 0)
        {
            conditionStr += " and ";
        }
        var conditionArray = key.match(/\$([a-z]+)/);
        if(!conditionArray)
        {
            var kv = "(";
            if(typeof data[key] == 'object')
            {
                kv += self.condition(data[key], key);
            }
            else
            {
                kv += self.getKvPair(key, "=", data[key]);
            }
            kv += ")";
            conditionStr += kv;
        }
        else
        {
            var expression = "";
            if(conditionArray[1] == 'or')
            {
                expression += "(";
                var orKeyCount = 0;
                var orKeyData = data[key];
                for(var orKey in orKeyData)
                {
                    if(orKeyCount > 0)
                    {
                        expression += ' or ';
                    }
                    expression += self.condition(orKeyData[orKey]);
                    orKeyCount++;
                }
                expression += ")";
            }
            else if(conditionArray[1] == 'gt')
            {
                expression += self.getKvPair(parentKey, ">", data[key]);
            }
            else if(conditionArray[1] == 'gte')
            {
                expression += self.getKvPair(parentKey, ">=", data[key]);
            }
            else if(conditionArray[1] == 'lt')
            {
                expression += self.getKvPair(parentKey, "<", data[key]);
            }
            else if(conditionArray[1] == 'lte')
            {
                expression += self.getKvPair(parentKey, "<=", data[key]);
            }
            else if(conditionArray[1] == 'ne')
            {
                expression += self.getKvPair(parentKey, "!=", data[key]);
            }
            else if(conditionArray[1] == 'in')
            {
                var inList = data[key];
                var inListCount = 0;
                var inStr = "(";
                for(var inListKey in inList)
                {
                    if(inListCount > 0)
                    {
                        inStr += ",";
                    }
                    inStr += inList[inListKey];
                    inListCount++;
                }
                inStr += ")";
                expression += self.getKvPair(parentKey, "in", inStr);
            }
            conditionStr += expression;
        }
        i++;
    }
    return conditionStr;
};

/**
 * 获得键值对
 * @param col
 * @param value
 */
Table.prototype.getKvPair = function(colName, op, value)
{
    var self = this;
    var col = self.colList[colName];
    if(col == undefined)
    {
        if(colName == 'rownum')
        {
            return "rownum " + op + " " + value;
        }
        else
        {
            return "";
        }
    }
    else
    {
        var exp = col.getName() + " " + op + " ";
        if(col.getType() == 'int' || col.getType() == "bigint")
        {
            exp += value;
        }
        else if(col.getType() == 'date')
        {
            var str = '';
            if(self.db.type == prop.dbType.mysql)
            {
                str += "'" + dateUtil.toString(value) + "'";
            }
            else if(self.db.type == prop.dbType.oracle)
            {
                str += "to_date('" + value + "', 'yyyy-MM-dd HH24:mi:ss')";
            }
            exp += str;
        }
        else
        {
            exp += "'" + value + "'";
        }
        return exp;
    }
};

/**
 * 查询
 * @param data
 * @param cb
 */
Table.prototype.find = function(data, columns, options)
{
    var self = this;
    if(self.db.type == prop.dbType.mongodb)
    {
        return self.col.find(data, columns);
    }
    else
    {
        var sql = "select ";
        var keyStr = '';
        var i = 0;
        if(columns._id == undefined)
        {
            columns._id = 1;
        }
        if(columns.id == undefined)
        {
            columns.id = 1;
        }
        for(var key in columns)
        {
            //如果没有相关的列，则直接忽略
            var tCol = self.colList[key];
            if(tCol == undefined)
            {
                continue;
            }
            if(i > 0)
            {
                keyStr += ",";
            }
            if(columns[key] == 1)
            {
                keyStr += key;
            }
            i++;
        }
        if(i == 1)  //用户未指定列，则选择所有的列
        {
            keyStr = "*";
        }
        sql += keyStr;
        sql += " from " + self.name;

        var conditionStr = self.condition(data);
        if(conditionStr.length > 0)
        {
            sql += " where " + conditionStr;
        }
        if(options == undefined)
        {
            options = [];
        }
        return new DbCursor(self, options, sql);
    }
};

/**
 * remove documents from table
 * @param condtion
 * @param option
 * @param cb
 */
Table.prototype.remove = function(condtion, options, cb)
{
    var self = this;
    if(self.db.type == prop.dbType.mongodb)
    {
        self.col.remove(condtion, options, cb);
    }
    else
    {
        var sql = "delete from " + self.name;
        var conditionStr = self.condition(condtion);
        if(conditionStr.length > 0)
        {
            sql += " where " + conditionStr;
        }
        log.info(sql);
        var conn = self.db.pool.getConn();
        conn.execute(sql, options, function(err, data){
            cb(err, data);
        });
    }
};

module.exports = Table;
