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

PrintMgDb.prototype.check = function(){

};

/**
 * get col by name
 * @param name
 */
PrintMgDb.prototype.get = function(name){
    var self = this;
    return self.db.collection(name);
};

module.exports = new PrintMgDb();