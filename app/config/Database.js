var Column = require('./Column.js');
var Table = require('./Table.js');
var dbPool = require('./DbPool.js');

var Database = function()
{
    var self = this;
    self.tables = new Array();
};

Database.prototype.put = function(table)
{
    var self = this;
    self.tables[table.getName()] = table;
};

/**
 * 通过名称查找表
 * @param name
 */
Database.prototype.get = function(name)
{
    var self = this;
    return self.tables[name];
};

Database.prototype.createByIndex = function(table, cb)
{
    var tableName = table.getName();
    var dropSql = "drop table " + tableName + ";";
    var createSql = table.getDdl();
    dbPool.conn.query(dropSql, function(err, rows, fields) {
        if (err)
        {
            console.log("table " + tableName + " not exists.");
        }
        else
        {
            console.log("table " + tableName + " dropped success!");
        }
        console.log(createSql);
        dbPool.conn.query(createSql, function(err, rows, fields) {
            if (err) throw err;
            console.log("table " + tableName + " create success!");
            cb();
        });
    });
};

Database.prototype.create = function(cb)
{
    var self = this;
    var tables = self.tables;
    var finishedCount = 0;
    var count = 0;
    for(var name in tables)
    {
        count++;
    }
    var tCb = function(){
        finishedCount++;
        if(finishedCount >= count)
        {
            cb();
        }
    };
    for(var name in tables)
    {
        self.createByIndex(tables[name], tCb);
    }
};

var db = new Database();
//用户表
var user = new Table("user", "mysql", [
    new Column("_id", "int", 11, false, undefined, true, true),
    new Column("name", "varchar", 40, false, undefined),
    new Column("password", "varchar", 80, false, undefined),
    new Column("userTypeId", "varchar", 20, false, undefined)
]);
db.put(user);
//角色表
var userType = new Table("userType", "mysql", [
    new Column("_id", "varchar", 20, false, undefined, true, false),
    new Column("name", "varchar", 40, false, undefined)
 ]);
db.put(userType);
//可用操作表
var operation = new Table("operation", "mysql", [
    new Column("_id", "int", 11, false, undefined, true, true),
    new Column("name", "varchar", 40, false, undefined),
    new Column("url", "varchar", 100, false, ""),
    new Column("parentId", "int", 11, false, -1),
    new Column("hasChildren", "int", 11, false, 0)]);
db.put(operation);
//角色可用操作表
var userOperation = new Table("userOperation", "mysql", [
    new Column("_id", "int", 11, false, undefined, true, true),
    new Column("userTypeId", "varchar", 20, false),
    new Column("operationId", "int", 11, false)
]);
db.put(userOperation);
//接口表
var cmd = new Table("cmd", "mysql", [
    new Column("_id", "int", 11, false, undefined, true, true),
    new Column("code", "varchar", 40, false),
    new Column("des", "varchar", 100, false)
]);
db.put(cmd);
//用户权限表
var userCmd = new Table("userCmd", "mysql", [
    new Column("_id", "int", 11, false, undefined, true, true),
    new Column("cmdCode", "varchar", 40, false),
    new Column("userTypeId", "varchar", 20, false)
]);
db.put(userCmd);
//uniqueid of msg
var uniqueId = new Table("uniqueId", "mysql", [
    new Column("_id", "varchar", 32, false, undefined, true, false)
]);
db.put(uniqueId);
//st infomation
var stInfo = new Table("stInfo", "mysql", [
    new Column("_id", "varchar", 40, false, undefined, true, false),
    new Column("lastActiveTime", "bigint", -1, false, undefined),
    new Column("st", "varchar", 32, false, undefined)
]);
db.put(stInfo);
//machine
var machine = new Table("machine", "mysql", [
    new Column("_id", "varchar", 40, false, undefined, true, false),
    new Column("ip", "varchar", 40, false, undefined)
]);
db.put(machine);
//process info
var proInfo = new Table("proInfo", "mysql", [
    new Column("_id", "int", 11, false, undefined, true, true),
    new Column("status", "int", 11, false, -1),
    new Column("machineId", "varchar", 40, false, undefined),
    new Column("proc", "varchar", 80, false, undefined)
]);
db.put(proInfo);
module.exports = db;




