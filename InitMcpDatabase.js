var async = require('async');
var db = require('./app/config/McpDataBase.js');
var prop = require('./app/config/Prop.js');

var InitMcpDatabase = function(){};

InitMcpDatabase.prototype.init = function()
{
    async.waterfall([
        //connect to the db
        function(cb){
            db.connect(function(err){
                console.log(db.getConn());
                cb(null);
            });
        },
        function(cb){
            db.create(function(){
                cb(null);
            });
        }
    ], function (err, result) {
        if(err)
        {
            console.log('err: ', err); // -> null
        }
        else
        {
            console.log('result: ', result); // -> 16
        }
    });
};

var init = new InitMcpDatabase();
init.init();


