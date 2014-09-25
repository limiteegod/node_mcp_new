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

McpDatabase.prototype.connect = function(cb)
{
    var self = this;
    dbPool.connect(cb);
};

McpDatabase.prototype.close = function()
{
    var self = this;
    dbPool.getConn().close();
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
    dbPool.getConn().execute(dropSql, [], function(err, rst) {
        if (err)
        {
            console.log("table " + tableName + " not exists.");
        }
        else
        {
            console.log("table " + tableName + " dropped success!");
        }
        console.log(createSql);
        dbPool.getConn().execute(createSql, [], function(err, rst) {
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
var game = new Table(db, "game", "oracle", [
    new Column("ID", "varchar", 32, false, undefined, true, false),
    new Column("CODE", "varchar", 40, false, undefined),
    new Column("NAME", "varchar", 40, false, undefined),
    new Column("PUBLISHDESC", "varchar", 40, false, undefined),
    new Column("PERIOD", "varchar", 40, false, undefined),
    new Column("DESCRIPTION", "varchar", 40, false, undefined),
    new Column("STATUS", "int", 11, false, undefined),
    new Column("ISSYNCHRO", "int", 11, false, undefined),
    new Column("OFFSET", "int", 11, false, undefined),
    new Column("TYPE", "int", 11, false, undefined)
]);
db.put(game);
//term
var term = new Table(db, "term", "oracle", [
    new Column("ID", "varchar", 32, false, undefined, true, false),
    new Column("CODE", "varchar", 40, false, undefined),
    new Column("NEXTCODE", "varchar", 40, false, undefined),
    new Column("NAME", "varchar", 40, false, undefined),
    new Column("GAMECODE", "varchar", 10, false, undefined),
    new Column("PRIZEPOOL", "int", 11, false, undefined),
    new Column("CREATETIME", "date", -1, false, undefined),
    new Column("OPENTIME", "date", -1, false, undefined),
    new Column("ENDTIME", "date", -1, false, undefined),
    new Column("WINNINGNUMBER", "varchar", 40, true, undefined),
    new Column("PRIZEDESC", "varchar", 2048, true, undefined),
    new Column("STATUS", "int", 11, false, undefined),
    new Column("VERSION", "int", 11, false, undefined),
    new Column("DETAILINFO", "varchar", 560, true, undefined),
    new Column("CONCEDEPOINTS", "int", 11, false, undefined),
    new Column("MATCHTIME", "date", -1, true, undefined)
]);
db.put(term);
//the station
var station = new Table(db, "station", "oracle", [
    new Column("ID", "varchar", 32, false, undefined, true, false),
    new Column("CODE", "varchar", 40, false, undefined),
    new Column("RELAYABLE", "int", 11, false, undefined),
    new Column("NAME", "varchar", 40, false, undefined),
    new Column("PASSWORD", "varchar", 40, false, undefined),
    new Column("DESCRIPTION", "varchar", 40, false, undefined),
    new Column("BALANCE", "bigint", -1, false, 0),
    new Column("PHOTO", "varchar", 40, false, undefined),
    new Column("BUILDTIME", "date", -1, true, undefined),
    new Column("EXPIREDTIME", "date", -1, true, undefined),
    new Column("LASTLOGINTIME", "date", -1, true, undefined),
    new Column("STATIONTYPE", "int", 11, false, undefined),
    new Column("STATUS", "int", 11, false, undefined),
    new Column("VERSION", "int", 11, false, undefined),
    new Column("QUEUEINDEX", "int", 11, false, undefined),
    new Column("SECRETKEY", "varchar", 32, false, undefined),
    new Column("UQ_CODE", "UNIQUE", -1, false, 'code')
]);
db.put(station);
var stationGame = new Table(db, "stationgame", "oracle", [
    new Column("ID", "varchar", 32, false, undefined, true, false),
    new Column("STATIONID", "varchar", 32, false, undefined),
    new Column("RELAYTOID", "varchar", 32, false, undefined),
    new Column("RELAYTOEXPIRED", "date", -1, true, undefined),
    new Column("GAMECODE", "varchar", 20, false, undefined),
    new Column("EARLYSTOPBUFFERSIMPLEX", "int", 11, false, 0),
    new Column("EARLYSTOPBUFFERDUPLEX", "int", 11, false, 0),
    new Column("STATUS", "int", 11, false, prop.stationGameStatus.open),
    new Column("RFACTOR", "int", 11, false, undefined),
    new Column("PFACTOR", "int", 11, false, undefined)
]);
db.put(stationGame);
module.exports = db;




