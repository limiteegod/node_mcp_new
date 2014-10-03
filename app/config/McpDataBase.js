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
    dbPool.getConn().query(dropSql, [], function(err, rst) {
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
//order
var torder = new Table(db, "torder", "oracle", [
    new Column("id", "varchar", 32, false, undefined, true, false),
    new Column("termCode", "varchar", 40, false, undefined),
    new Column("schemeId", "varchar", 32, false, undefined),
    new Column("stationId", "varchar", 32, false, undefined),
    new Column("gameCode", "varchar", 10, false, undefined),
    new Column("outerId", "varchar", 40, false, undefined),
    new Column("customerId", "varchar", 32, false, undefined),
    new Column("schemeType", "int", 11, false, undefined),
    new Column("channelCode", "varchar", 20, false, undefined),
    new Column("amount", "bigint", -1, false, undefined),
    new Column("ticketCount", "int", 11, false, undefined),
    new Column("bonus", "bigint", -1, false, undefined),
    new Column("bonusBeforeTax", "bigint", -1, false, undefined),
    new Column("takeAwayTime", "date", -1, false, undefined),
    new Column("takeAway", "int", 11, false, undefined),
    new Column("createTime", "date", -1, false, undefined),
    new Column("acceptTime", "date", -1, false, undefined),
    new Column("printTime", "date", -1, false, undefined),
    new Column("platform", "varchar", 20, false, undefined),
    new Column("payType", "int", 11, false, undefined),
    new Column("notes", "varchar", 40, false, undefined),
    new Column("encrypt", "varchar", 80, false, undefined),
    new Column("status", "int", 11, false, undefined),
    new Column("finishedTicketCount", "int", 11, false, undefined),
    new Column("printCount", "int", 11, false, undefined),
    new Column("printFailCount", "int", 11, false, undefined),
    new Column("multiple", "int", 11, false, undefined),
    new Column("numbers", "varchar", 400, false, undefined),
    new Column("dNumber", "varchar", 80, false, undefined),
    new Column("printStationId", "varchar", 32, false, undefined),
    new Column("type", "int", 11, false, undefined)
]);
db.put(torder);
//tticket
var tticket = new Table(db, "tticket", "oracle", [
    new Column("id", "varchar", 32, false, undefined, true, false),
    new Column("orderId", "varchar", 32, false, undefined),
    new Column("seq", "int", 11, false, undefined),
    new Column("finishedCount", "int", 11, false, undefined),
    new Column("terminalId", "varchar", 32, false, undefined),
    new Column("stationId", "varchar", 32, false, undefined),
    new Column("customerId", "varchar", 32, false, undefined),
    new Column("channelCode", "varchar", 10, false, undefined),
    new Column("termCode", "varchar", 240, false, undefined),
    new Column("gameCode", "varchar", 10, false, undefined),
    new Column("betTypeCode", "varchar", 10, false, undefined),
    new Column("playTypeCode", "varchar", 10, false, undefined),
    new Column("amount", "bigint", -1, false, undefined),
    new Column("multiple", "int", 11, false, undefined),
    new Column("price", "int", 11, false, undefined),
    new Column("numbers", "varchar", 360, false, undefined),
    new Column("rNumber", "varchar", 360, false, undefined),
    new Column("dNumber", "varchar", 80, false, undefined),
    new Column("termIndex", "int", 11, false, undefined),
    new Column("termIndexDeadline", "date", -1, false, undefined),
    new Column("createTime", "date", -1, false, undefined),
    new Column("acceptTime", "date", -1, false, undefined),
    new Column("printTime", "date", -1, false, undefined),
    new Column("serialNumber", "varchar", 80, false, undefined),
    new Column("stubInfo", "varchar", 2048, false, undefined),
    new Column("encrypt", "varchar", 80, false, undefined),
    new Column("type", "int", 11, false, undefined),
    new Column("bigBonus", "int", 11, false, undefined),
    new Column("winDesc", "varchar", 200, false, undefined),
    new Column("bonus", "bigint", -1, false, undefined),
    new Column("bonusBeforeTax", "bigint", -1, false, undefined),
    new Column("possiblePrize", "bigint", -1, false, undefined),
    new Column("receiptStatus", "int", 11, false, undefined),
    new Column("status", "int", 11, false, undefined),
    new Column("paper", "int", 11, false, undefined),
    new Column("printerStationId", "varchar", 32, false, undefined),
    new Column("sysTakeTime", "date", -1, false, undefined),
    new Column("version", "int", 11, false, undefined)
]);
db.put(tticket);
//game
var game = new Table(db, "game", "oracle", [
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
var term = new Table(db, "term", "oracle", [
    new Column("id", "varchar", 32, false, undefined, true, false),
    new Column("code", "varchar", 40, false, undefined),
    new Column("nextCode", "varchar", 40, false, undefined),
    new Column("name", "varchar", 40, false, undefined),
    new Column("gameCode", "varchar", 10, false, undefined),
    new Column("prizePool", "int", 11, false, undefined),
    new Column("createTime", "date", -1, false, undefined),
    new Column("openTime", "date", -1, false, undefined),
    new Column("endTime", "date", -1, false, undefined),
    new Column("winningNumber", "varchar", 40, true, undefined),
    new Column("prizeDesc", "varchar", 2048, true, undefined),
    new Column("status", "int", 11, false, undefined),
    new Column("version", "int", 11, false, undefined),
    new Column("detailInfo", "varchar", 560, true, undefined),
    new Column("concedePoints", "int", 11, false, undefined),
    new Column("matchTime", "date", -1, true, undefined)
]);
db.put(term);
//the station
var station = new Table(db, "station", "oracle", [
    new Column("id", "varchar", 32, false, undefined, true, false),
    new Column("code", "varchar", 40, false, undefined),
    new Column("relayable", "int", 11, false, undefined),
    new Column("name", "varchar", 40, false, undefined),
    new Column("password", "varchar", 40, false, undefined),
    new Column("description", "varchar", 40, false, undefined),
    new Column("balance", "bigint", -1, false, 0),
    new Column("photo", "varchar", 40, false, undefined),
    new Column("buildTime", "date", -1, true, undefined),
    new Column("expiredTime", "date", -1, true, undefined),
    new Column("lastLoginTime", "date", -1, true, undefined),
    new Column("stationType", "int", 11, false, undefined),
    new Column("status", "int", 11, false, undefined),
    new Column("version", "int", 11, false, undefined),
    new Column("queueIndex", "int", 11, false, undefined),
    new Column("secretKey", "varchar", 32, false, undefined),
    new Column("uc_code", "UNIQUE", -1, false, 'code')
]);
db.put(station);
var stationGame = new Table(db, "stationgame", "oracle", [
    new Column("id", "varchar", 32, false, undefined, true, false),
    new Column("stationId", "varchar", 32, false, undefined),
    new Column("relayToId", "varchar", 32, false, undefined),
    new Column("relayToExpired", "date", -1, true, undefined),
    new Column("gameCode", "varchar", 20, false, undefined),
    new Column("earlyStopBufferSimplex", "int", 11, false, 0),
    new Column("earlyStopBufferDuplex", "int", 11, false, 0),
    new Column("status", "int", 11, false, prop.stationGameStatus.open),
    new Column("rFactor", "int", 11, false, undefined),
    new Column("pFactor", "int", 11, false, undefined)
]);
db.put(stationGame);
module.exports = db;




