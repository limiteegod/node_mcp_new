var prop = require('./Prop.js');
var MongoClient = require('mongodb').MongoClient;

var PrintMgDb = function(){
    var self = this;
};

PrintMgDb.prototype.connect = function(cb){
    var self = this;
    MongoClient.connect(prop.mongo.url, function(err, db) {
        self.db = db;
        cb(err, db);
    });
};

PrintMgDb.prototype.check = function(cb){
    var self = this;
    var kvTable = self.db.collection("kv");
    kvTable.findOne({_id:"zzcid"}, {}, function(err, data){
        console.log(data);
        if(data)
        {
            cb();
        }
        else
        {
            kvTable.insert({_id:"zzcid", value:1}, function(err, data){
                cb();
            });
        }
    });
};

/**
 * get col by name
 * @param name
 */
PrintMgDb.prototype.get = function(name, cb){
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
PrintMgDb.prototype.getZzcId = function(cb){
    var self = this;
    var kvTable = self.db.collection("kv");
    kvTable.findAndModify({_id:"zzcid"}, {}, {$inc:{value:1}}, {}, function(err, data){
        cb(err, data);
    });
};

module.exports = new PrintMgDb();