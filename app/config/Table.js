var dbPool = require('./DbPool.js');
var DbCursor = require('./DbCursor.js');

var Table = function(db, name, engine, colList){
    var self = this;
    self.db = db;
    self.name = name;
    self.engine = engine;
    self.colList = new Array();
    for(var key in colList)
    {
        var col = colList[key];
        self.colList[col.getName()] = col;
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
 * 保存对象
 * @param cb
 */
Table.prototype.save = function(data, cb)
{
    var self = this;
    var sql = "insert into " + self.name + "(";
    var keyStr = '';
    var valueStr = '';
    var i = 0;
    for(var key in data)
    {
        //如果没有相关的列，则直接忽略
        if(self.colList[key] == undefined)
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
        else
        {
            valueStr += value;
        }
        i++;
    }
    sql += keyStr + ") values(" + valueStr + ");";
    console.log(sql);
    self.db.getConn().query(sql, function(err, rows, fields) {
        if(cb != undefined)
        {
            cb(err, rows, data);
        }
    });
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
                        pStr += self.getKvPair(col, "=", setData[setKey]);
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
    var sql = "update " + self.name + " set ";
    sql += self.getUpdateStr(data);
    var conditionStr = self.condition(condition);
    if(conditionStr.length > 0)
    {
        sql += " where " + conditionStr;
    }
    console.log(sql);
    self.db.getConn().query(sql, function(err, rows, fields) {
        if(cb != undefined)
        {
            cb(err, rows, data);
        }
    });
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
            var col = self.colList[key];
            if(col == undefined)
            {
                //如果没有相关的列，则直接忽略
                continue;
            }
            var kv = "(";
            if(typeof data[key] == 'object')
            {
                kv += self.condition(data[key], key);
            }
            else
            {
                kv += self.getKvPair(col, "=", data[key]);
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
                var col = self.colList[parentKey];
                expression += self.getKvPair(col, ">", data[key]);
            }
            else if(conditionArray[1] == 'gte')
            {
                var col = self.colList[parentKey];
                expression += self.getKvPair(col, ">=", data[key]);
            }
            else if(conditionArray[1] == 'lt')
            {
                var col = self.colList[parentKey];
                expression += self.getKvPair(col, "<", data[key]);
            }
            else if(conditionArray[1] == 'lte')
            {
                var col = self.colList[parentKey];
                expression += self.getKvPair(col, "<=", data[key]);
            }
            else if(conditionArray[1] == 'ne')
            {
                var col = self.colList[parentKey];
                expression += self.getKvPair(col, "!=", data[key]);
            }
            else if(conditionArray[1] == 'in')
            {
                var col = self.colList[parentKey];
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
                expression += self.getKvPair(col, "in", inStr);
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
Table.prototype.getKvPair = function(col, op, value)
{
    if(col == undefined)
    {
        return "";
    }
    else
    {
        var exp = col.getName() + " " + op + " ";
        if(col.getType() == 'int' || col.getType() == "bigint")
        {
            exp += value;
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
Table.prototype.find = function(data, columns)
{
    var self = this;
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
        if(self.colList[key] == undefined)
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
    return new DbCursor(self, sql);
};

/**
 * remove documents from table
 * @param condtion
 * @param option
 * @param cb
 */
Table.prototype.remove = function(condtion, option, cb)
{
    var self = this;
    var sql = "delete from " + self.name;
    var conditionStr = self.condition(condtion);
    if(conditionStr.length > 0)
    {
        sql += " where " + conditionStr;
    }
    console.log(sql);
    self.db.getConn().query(sql, cb);
};

module.exports = Table;
