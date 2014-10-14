var async = require('async');
var prop = require('./Prop.js');
var esdb = require("easy_db");
var esut = require("easy_util");
var Database = esdb.Database;
var Table = esdb.Table;
var Column = esdb.Column;
var log = esut.log;

var DbCenter = function(){
    var self = this;
};

DbCenter.prototype.init = function(cb)
{
    var self = this;
    esdb.log.setShowLog(true);
    async.waterfall([
        //the main db
        function(cb){
            self._initMain(function(err){
                cb(err);
            });
        },
        //the mongodb
        function(cb){
            self._initMg(function(err){
                cb(err);
            });
        },
        //check the mongodb
        function(cb){
            self._checkMg(function(err){
                cb(err);
            });
        }
    ], function (err, result) {
        cb(err);
    });
};

DbCenter.prototype._initMg = function(cb)
{
    var self = this;
    var index = 2;
    if(prop.target == 'run')
    {
        index = 3;
    }
    else if(prop.target == 'yun')
    {
        index = 5;
    }
    var db = new Database(prop.dbs[index]);

    //add tables
    var test = new Table(db, "test", [
        new Column(db, "_id", "varchar", 32, false, undefined, true, false),
    ]);
    db.put(test);
    var mcp_id = new Table(db, "mcp_id", [
        new Column(db, "_id", "varchar", 80, false, undefined, true, false),
        new Column(db, "value", "bigint", -1, false, undefined)
    ]);
    db.put(mcp_id);
    var stInfoTable = new Table(db, "stInfo", [
        new Column(db, "_id", "varchar", 80, false, undefined, true, false),
        new Column(db, "st", "varchar", 32, false, undefined),
        new Column(db, "lastActiveTime", "bigint", -1, false, undefined)
    ]);
    db.put(stInfoTable);
    self.mg = db;
    self.mg.init(cb);
};

DbCenter.prototype._checkMg = function(cb)
{
    var self = this;
    var kvTable = self.mg.get("mcp_id");
    kvTable.findOne({_id:"print_seq"}, {}, [], function(err, data){
        console.log(data);
        if(data)
        {
            cb(err, data);
        }
        else
        {
            kvTable.save({_id:"print_seq", value:1}, [], function(err, data){
                cb(err, data);
            });
        }
    });
};

DbCenter.prototype._initMain = function(cb)
{
    var self = this;
    var index = 0;
    if(prop.target == 'run')
    {
        index = 1;
    }
    else if(prop.target == 'yun')
    {
        index = 4;
    }
    var db = new Database(prop.dbs[index]);
    //add tables
    var torder = new Table(db, "torder", [
        new Column(db, "id", "varchar", 32, false, undefined, true, false),
        new Column(db, "termCode", "varchar", 40, false, undefined),
        new Column(db, "schemeId", "varchar", 32, false, undefined),
        new Column(db, "stationId", "varchar", 32, false, undefined),
        new Column(db, "gameCode", "varchar", 10, false, undefined),
        new Column(db, "outerId", "varchar", 40, false, undefined),
        new Column(db, "customerId", "varchar", 32, false, undefined),
        new Column(db, "schemeType", "int", 11, false, undefined),
        new Column(db, "channelCode", "varchar", 20, false, undefined),
        new Column(db, "amount", "bigint", -1, false, undefined),
        new Column(db, "ticketCount", "int", 11, false, undefined),
        new Column(db, "bonus", "bigint", -1, false, undefined),
        new Column(db, "bonusBeforeTax", "bigint", -1, false, undefined),
        new Column(db, "takeAwayTime", "date", -1, false, undefined),
        new Column(db, "takeAway", "int", 11, false, undefined),
        new Column(db, "createTime", "date", -1, false, undefined),
        new Column(db, "acceptTime", "date", -1, false, undefined),
        new Column(db, "printTime", "date", -1, false, undefined),
        new Column(db, "platform", "varchar", 20, false, undefined),
        new Column(db, "payType", "int", 11, false, undefined),
        new Column(db, "notes", "varchar", 40, false, undefined),
        new Column(db, "encrypt", "varchar", 80, false, undefined),
        new Column(db, "status", "int", 11, false, undefined),
        new Column(db, "finishedTicketCount", "int", 11, false, undefined),
        new Column(db, "printCount", "int", 11, false, undefined),
        new Column(db, "printFailCount", "int", 11, false, undefined),
        new Column(db, "multiple", "int", 11, false, 1),
        new Column(db, "numbers", "varchar", 400, false, undefined),
        new Column(db, "dNumber", "varchar", 80, false, undefined),
        new Column(db, "printStationId", "varchar", 32, false, undefined),
        new Column(db, "type", "int", 11, false, undefined)
    ]);
    db.put(torder);
    //tticket
    var tticket = new Table(db, "tticket", [
        new Column(db, "id", "varchar", 32, false, undefined, true, false),
        new Column(db, "orderId", "varchar", 32, false, undefined),
        new Column(db, "seq", "int", 11, false, undefined),
        new Column(db, "finishedCount", "int", 11, false, undefined),
        new Column(db, "terminalId", "varchar", 32, false, undefined),
        new Column(db, "stationId", "varchar", 32, false, undefined),
        new Column(db, "customerId", "varchar", 32, false, undefined),
        new Column(db, "channelCode", "varchar", 10, false, undefined),
        new Column(db, "termCode", "varchar", 240, false, undefined),
        new Column(db, "gameCode", "varchar", 10, false, undefined),
        new Column(db, "betTypeCode", "varchar", 10, false, undefined),
        new Column(db, "playTypeCode", "varchar", 10, false, undefined),
        new Column(db, "amount", "bigint", -1, false, undefined),
        new Column(db, "multiple", "int", 11, false, undefined),
        new Column(db, "price", "int", 11, false, undefined),
        new Column(db, "numbers", "varchar", 360, false, undefined),
        new Column(db, "rNumber", "varchar", 360, false, undefined),
        new Column(db, "dNumber", "varchar", 80, false, undefined),
        new Column(db, "termIndex", "int", 11, false, undefined),
        new Column(db, "termIndexDeadline", "date", -1, false, undefined),
        new Column(db, "createTime", "date", -1, false, undefined),
        new Column(db, "acceptTime", "date", -1, false, undefined),
        new Column(db, "printTime", "date", -1, false, undefined),
        new Column(db, "serialNumber", "varchar", 80, false, undefined),
        new Column(db, "stubInfo", "varchar", 2048, false, undefined),
        new Column(db, "encrypt", "varchar", 80, false, undefined),
        new Column(db, "type", "int", 11, false, undefined),
        new Column(db, "bigBonus", "int", 11, false, undefined),
        new Column(db, "winDesc", "varchar", 200, false, undefined),
        new Column(db, "bonus", "bigint", -1, false, undefined),
        new Column(db, "bonusBeforeTax", "bigint", -1, false, undefined),
        new Column(db, "possiblePrize", "bigint", -1, false, undefined),
        new Column(db, "receiptStatus", "int", 11, false, undefined),
        new Column(db, "status", "int", 11, false, undefined),
        new Column(db, "paper", "int", 11, false, undefined),
        new Column(db, "printerStationId", "varchar", 32, false, undefined),
        new Column(db, "sysTakeTime", "date", -1, false, undefined),
        new Column(db, "version", "int", 11, false, undefined)
    ]);
    db.put(tticket);
    //game
    var game = new Table(db, "game", [
        new Column(db, "id", "varchar", 32, false, undefined, true, false),
        new Column(db, "code", "varchar", 40, false, undefined),
        new Column(db, "name", "varchar", 40, false, undefined),
        new Column(db, "publishDesc", "varchar", 40, false, undefined),
        new Column(db, "period", "varchar", 40, false, undefined),
        new Column(db, "description", "varchar", 40, false, undefined),
        new Column(db, "status", "int", 11, false, undefined),
        new Column(db, "isSynchro", "int", 11, false, undefined),
        new Column(db, "offset", "int", 11, false, undefined),
        new Column(db, "type", "int", 11, false, undefined)
    ]);
    db.put(game);
    //term
    var term = new Table(db, "term", [
        new Column(db, "id", "varchar", 32, false, undefined, true, false),
        new Column(db, "code", "varchar", 40, false, undefined),
        new Column(db, "nextCode", "varchar", 40, false, undefined),
        new Column(db, "name", "varchar", 40, false, undefined),
        new Column(db, "gameCode", "varchar", 10, false, undefined),
        new Column(db, "prizePool", "int", 11, false, undefined),
        new Column(db, "createTime", "date", -1, false, undefined),
        new Column(db, "openTime", "date", -1, false, undefined),
        new Column(db, "endTime", "date", -1, false, undefined),
        new Column(db, "winningNumber", "varchar", 40, true, undefined),
        new Column(db, "prizeDesc", "varchar", 2048, true, undefined),
        new Column(db, "status", "int", 11, false, undefined),
        new Column(db, "version", "int", 11, false, undefined),
        new Column(db, "detailInfo", "varchar", 560, true, undefined),
        new Column(db, "concedePoints", "int", 11, false, undefined),
        new Column(db, "matchTime", "date", -1, true, undefined)
    ]);
    db.put(term);
    //the station
    var station = new Table(db, "station", [
        new Column(db, "id", "varchar", 32, false, undefined, true, false),
        new Column(db, "code", "varchar", 40, false, undefined),
        new Column(db, "relayable", "int", 11, false, undefined),
        new Column(db, "name", "varchar", 40, false, undefined),
        new Column(db, "password", "varchar", 40, false, undefined),
        new Column(db, "description", "varchar", 40, false, undefined),
        new Column(db, "balance", "bigint", -1, false, 0),
        new Column(db, "photo", "varchar", 40, false, undefined),
        new Column(db, "buildTime", "date", -1, true, undefined),
        new Column(db, "expiredTime", "date", -1, true, undefined),
        new Column(db, "lastLoginTime", "date", -1, true, undefined),
        new Column(db, "stationType", "int", 11, false, undefined),
        new Column(db, "status", "int", 11, false, undefined),
        new Column(db, "version", "int", 11, false, 0),
        new Column(db, "queueIndex", "int", 11, false, undefined),
        new Column(db, "secretKey", "varchar", 32, false, undefined),
        new Column(db, "uc_code", "UNIQUE", -1, false, 'code')
    ]);
    db.put(station);
    var admini = new Table(db, "admini", [
        new Column(db, "id", "varchar", 32, false, undefined, true, false),
        new Column(db, "name", "varchar", 40, false, undefined),
        new Column(db, "password", "varchar", 40, false, undefined),
        new Column(db, "type", "int", 11, false, 0),
        new Column(db, "version", "int", 11, false, 0)
    ]);
    db.put(admini);
    var stationGame = new Table(db, "stationgame", [
        new Column(db, "id", "varchar", 32, false, undefined, true, false),
        new Column(db, "stationId", "varchar", 32, false, undefined),
        new Column(db, "relayToId", "varchar", 32, false, undefined),
        new Column(db, "relayToExpired", "date", -1, true, undefined),
        new Column(db, "gameCode", "varchar", 20, false, undefined),
        new Column(db, "earlyStopBufferSimplex", "int", 11, false, 0),
        new Column(db, "earlyStopBufferDuplex", "int", 11, false, 0),
        new Column(db, "status", "int", 11, false, prop.stationGameStatus.open),
        new Column(db, "rFactor", "int", 11, false, undefined),
        new Column(db, "pFactor", "int", 11, false, undefined)
    ]);
    db.put(stationGame);
    var operation = new Table(db, "operation", [
        new Column(db, "id", "varchar", 40, false, undefined),
        new Column(db, "userType", "int", 11, false, undefined),
        new Column(db, "hasChildren", "int", 11, false, 0),
        new Column(db, "name", "varchar", 20, false, undefined),
        new Column(db, "parent", "varchar", 40, false, ''),
        new Column(db, "url", "varchar", 80, false, undefined),
        new Column(db, "status", "int", 11, false, 1),
        new Column(db, "version", "int", 11, false, 0)
    ]);
    db.put(operation);
    self.main = db;
    self.main.init(cb);
};

module.exports = new DbCenter();

