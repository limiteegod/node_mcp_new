var Column = require('./Column.js');
var Table = require('./Table.js');
var dbPool = require('./McpPool.js');
var prop = require('./Prop.js');


var McpDatabase = function()
{
    var self = this;
    self.tables = new Array();
};

McpDatabase.prototype.put = function(table)
{
    var self = this;
    self.tables[table.getName()] = table;
};

/**
 * 通过名称查找表
 * @param name
 */
McpDatabase.prototype.get = function(name)
{
    var self = this;
    return self.tables[name];
};

McpDatabase.prototype.getConn = function()
{
    var self = this;
    return dbPool.getConn();
};

McpDatabase.prototype.createByIndex = function(table, cb)
{
    var tableName = table.getName();
    var dropSql = "drop table " + tableName + ";";
    var createSql = table.getDdl();
    dbPool.getConn().query(dropSql, function(err, rows, fields) {
        if (err)
        {
            console.log("table " + tableName + " not exists.");
        }
        else
        {
            console.log("table " + tableName + " dropped success!");
        }
        console.log(createSql);
        dbPool.getConn().query(createSql, function(err, rows, fields) {
            if (err) throw err;
            console.log("table " + tableName + " create success!");
            cb();
        });
    });
};

McpDatabase.prototype.create = function(cb)
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

var db = new McpDatabase();
//game
var game = new Table(db, "game", "mysql", [
    new Column("id", "varchar", 32, false, undefined, true, false),
    new Column("code", "varchar", 40, false, undefined),
    new Column("name", "varchar", 40, false, undefined),
    new Column("publishDesc", "varchar", 40, false, undefined),
    new Column("period", "varchar", 40, false, undefined),
    new Column("description", "varchar", 40, false, undefined),
    new Column("status", "int", 11, false, undefined),
    new Column("isSynchro", "int", 11, false, undefined),
    new Column("offset", "int", 11, false, undefined),
    new Column("type", "int", 11, false, undefined)
]);
db.put(game);
//term
var term = new Table(db, "term", "mysql", [
    new Column("id", "varchar", 32, false, undefined, true, false),
    new Column("code", "varchar", 40, false, undefined),
    new Column("nextCode", "varchar", 40, false, undefined),
    new Column("name", "varchar", 40, false, undefined),
    new Column("gameCode", "varchar", 10, false, undefined),
    new Column("prizePool", "int", 11, false, undefined),
    new Column("createTime", "datetime", -1, false, undefined),
    new Column("openTime", "datetime", -1, false, undefined),
    new Column("endTime", "datetime", -1, false, undefined),
    new Column("winningNumber", "varchar", 40, true, undefined),
    new Column("prizeDesc", "varchar", 2048, true, undefined),
    new Column("status", "int", 11, false, undefined),
    new Column("version", "int", 11, false, undefined),
    new Column("detailInfo", "varchar", 560, true, undefined),
    new Column("concedePoints", "int", 11, false, undefined),
    new Column("matchTime", "datetime", -1, true, undefined)
]);
db.put(term);
//the station
var station = new Table(db, "station", "mysql", [
    new Column("id", "varchar", 32, false, undefined, true, false),
    new Column("code", "varchar", 40, false, undefined),
    new Column("relayable", "int", 11, false, undefined),
    new Column("name", "varchar", 40, false, undefined),
    new Column("password", "varchar", 40, false, undefined),
    new Column("description", "varchar", 40, false, undefined),
    new Column("balance", "bigint", -1, false, 0),
    new Column("photo", "varchar", 40, false, undefined),
    new Column("buildTime", "datetime", -1, true, undefined),
    new Column("expiredTime", "datetime", -1, true, undefined),
    new Column("lastLoginTime", "datetime", -1, true, undefined),
    new Column("stationType", "int", 11, false, undefined),
    new Column("status", "int", 11, false, undefined),
    new Column("version", "int", 11, false, undefined),
    new Column("queueIndex", "int", 11, false, undefined),
    new Column("secretKey", "varchar", 32, false, undefined),
    new Column("uc_code", "UNIQUE", -1, false, 'code')
]);
db.put(station);
var stationGame = new Table(db, "stationgame", "mysql", [
    new Column("id", "varchar", 32, false, undefined, true, false),
    new Column("stationId", "varchar", 32, false, undefined),
    new Column("relayToId", "varchar", 32, false, undefined),
    new Column("relayToExpired", "datetime", -1, true, undefined),
    new Column("gameCode", "varchar", 20, false, undefined),
    new Column("earlyStopBufferSimplex", "int", 11, false, 0),
    new Column("earlyStopBufferDuplex", "int", 11, false, 0),
    new Column("status", "int", 11, false, prop.stationGameStatus.open),
    new Column("rFactor", "int", 11, false, undefined),
    new Column("pFactor", "int", 11, false, undefined)
]);
db.put(stationGame);
module.exports = db;




