var prop = require('./Prop.js');
var MongoClient = require('mongodb').MongoClient;

var McpMgDb = function(){
    var self = this;
};

McpMgDb.prototype.connect = function(cb){
    var self = this;
    MongoClient.connect(prop.mcpmg.url, function(err, db) {
        self.db = db;
        cb(err, db);
    });
};

McpMgDb.prototype.check = function(cb){
    var self = this;
    var kvTable = self.db.collection("mcp_id");
    kvTable.findOne({_id:"print_seq"}, {}, function(err, data){
        console.log(data);
        if(data)
        {
            cb();
        }
        else
        {
            kvTable.insert({_id:"print_seq", value:1}, function(err, data){
                cb();
            });
        }
    });
};

/**
 * get col by name
 * @param name
 */
McpMgDb.prototype.get = function(name, cb){
    var self = this;
    if(name)
    {
        return self.db.collection(name);
    }
    else
    {
        return self.db.collections(cb);
    }
};

/**
 * get col by name
 * @param name
 */
McpMgDb.prototype.getPrintSeqId = function(cb){
    var self = this;
    var kvTable = self.db.collection("mcp_id");
    kvTable.findAndModify({_id:"print_seq"}, {}, {$inc:{value:1}}, {}, function(err, data){
        cb(err, data);
    });
};

module.exports = new McpMgDb();