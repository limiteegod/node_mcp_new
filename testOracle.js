var db = require('./app/config/McpDataBase.js');
var dateUtil = require('./app/util/DateUtil.js');
var moment = require("moment");

/*
var date = new Date(2013, 11, 24, 18, 0, 1);  // Client timezone dependent
console.log(date.toString());      // Tue Dec 24 2013 18:00:01 GMT-0700 (MST)
console.log(date.toISOString());*/

/*db.connect(function(err, conn){
    var newEndTime = '2014-09-26 14:50:00';
    var termTable = db.get("term");
    termTable.update({gameCode:'T51', code:'201409265001'},
        {$set:{endTime:newEndTime}}, {}, function(err, data){
        console.log(data);
    });
});*/

db.connect(function(err, conn){
    if(err) throw err;
    var termTable = db.get("term");
    termTable.find({GAMECODE:'T51', CODE:'201409265001'}, {}).toArray(function(err, data){
        console.log(err);
        console.log(data[0]);
    });
});

/*
db.connect(function(err, conn){

    var gameTable = db.get("game");
    gameTable.find({rownum:{$lt:2}}, {}).toArray(function(err, data){
        console.log(data);
    });
});*/
