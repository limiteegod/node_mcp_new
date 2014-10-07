var mysql = require('mysql');
var oracle = require('oracle');
var MongoClient = require('mongodb').MongoClient;
var prop = require('./Prop.js');
var DbConnection = require('./DbConnection.js');
var log = require('../util/McpLog.js');

var DbPool = function(db){
    var self = this;
    self.db = db;
    self.conns = [];
};

DbPool.prototype.connect = function(cb)
{
    var self = this;
    if(self.db.type == prop.dbType.mysql)
    {
        var conn = mysql.createConnection(self.db.config);
        conn.connect(function(err){
            self.conns[self.conns.length] = new DbConnection(self.db, self, conn);
            cb(err);
        });
    }
    else if(self.db.type == prop.dbType.oracle)
    {
        oracle.connect(self.db.config, function(err, connection) {
            self.conns[self.conns.length] = new DbConnection(self.db, self, connection);
            cb(err);
        });
    }
    else if(self.db.type == prop.dbType.mongodb)
    {
        MongoClient.connect(self.db.config.url, function(err, db) {
            if (err) throw err;
            self.conns[self.conns.length] = new DbConnection(self.db, self, db);
            cb(err);
        });
    }
    else
    {
        cb(ec.E9000);
    }
};

DbPool.prototype.getConn = function(index)
{
    var self = this;
    if(index == undefined)
    {
        index = 0;
    }
    return self.conns[index];
};

module.exports = DbPool;
