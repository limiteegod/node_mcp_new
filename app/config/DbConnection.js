var prop = require('./Prop.js');
var ec = require('./ErrCode.js');

var DbConnection = function(db, pool, conn){
    var self = this;
    self.db = db;
    self.pool = pool;
    self.conn = conn;
};

DbConnection.prototype.execute = function(sql, options, cb)
{
    var self = this;
    if(self.db.type == prop.dbType.mysql)
    {
        self.conn.query(sql, cb);
    }
    else if(self.db.type == prop.dbType.oracle)
    {
        self.conn.execute(sql, options, cb);
    }
    else
    {
        cb(ec.E9000);
    }
};

module.exports = DbConnection;