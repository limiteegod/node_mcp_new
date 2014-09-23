var async = require('async');
var moment = require('moment');
var prop = require('./app/config/Prop.js');
var mcpdb = require('./app/config/McpDataBase.js');
var digestUtil = require('./app/util/DigestUtil.js');

var ResetMcpDatabase = function(){
    var self = this;
    self.dateFmt = "YYYY-MM-DD HH:mm:ss";
};

ResetMcpDatabase.prototype.resetF01 = function()
{
    var self = this;
    var termTable = mcpdb.get("term");
    var gameCode = 'F01';
    async.waterfall([
        //check the game
        function(cb)
        {
            var gameTable = mcpdb.get("game");
            gameTable.find({code:"F01"}, {}).toArray(function(err, data){
                if(err) throw err;
                if(data.length == 0)
                {
                    gameTable.save({id:digestUtil.createUUID(), code:'F01', name:'双色球', type:prop.gameType.normal});
                    cb(null);
                }
            });
        },
        //start socket
        function(cb)
        {
            termTable.remove({gameCode:gameCode}, {}, function(err, data){
                console.log(data);
                cb(null);
            });
        },
        //save the term
        function(cb)
        {
            console.log(moment().format());
            var openTime = moment();
            var gap = 60*60*1000;
            var endTime = moment(openTime).add(gap, 'milliseconds');
            termTable.save({id:digestUtil.createUUID(), gameCode:gameCode, code:'20140923002',
                nextCode:'20140923003', openTime:openTime.format(self.dateFmt), createTime:openTime.format(self.dateFmt),
                endTime:endTime.format(self.dateFmt), name:'20140923002',
                prizeDesc:self.getPrizeDesc(gameCode), status:1100,
                winningNumber:"09,14,17,18,21,25|15"});
            cb(null);
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

ResetMcpDatabase.prototype.resetT01 = function()
{
    var self = this;
    var termTable = mcpdb.get("term");
    var gameCode = 'T01';
    async.waterfall([
        //start socket
        function(cb)
        {
            termTable.remove({gameCode:"T01"}, {}, function(err, data){
                console.log(data);
                cb(null);
            });
        },
        //start web
        function(cb)
        {
            console.log(moment().format());
            var openTime = moment();
            var gap = 60*60*1000;
            var endTime = moment(openTime).add(gap, 'milliseconds');
            termTable.save({id:digestUtil.createUUID(), gameCode:gameCode, code:'2014001',
                nextCode:'2014002', openTime:openTime.format(self.dateFmt),
                endTime:endTime.format(self.dateFmt), name:'2014001',
                prizeDesc:self.getPrizeDesc(gameCode), status:1100,
                winningNumber:'11,13,20,28,35|01,05'});
            cb(null);
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

ResetMcpDatabase.prototype.resetStation = function()
{
    var self = this;
    var stationTable = mcpdb.get("station");
    async.waterfall([
        //delete
        function(cb)
        {
            stationTable.remove({code:"Q0003"}, {}, function(err, data){
                console.log(data);
                cb(null);
            });
        },
        //print station
        function(cb)
        {
            stationTable.save({id:digestUtil.createUUID(), code:"C0001", balance:0, stationType:prop.stationType.center,
                status:prop.stationStatus.open, secretKey:'cad6011f5f174a359d9a36e06aada07e'}, function(err, rows, data){
                cb(null, data);
            });
        },
        //save print station game
        function(pstation, cb)
        {
            var stationGame = mcpdb.get("stationgame");
            stationGame.save({id:digestUtil.createUUID(), stationId:pstation.id, gameCode:'F01',
                relayToId:pstation.id, rFactor:100, pFactor:9000}, function(err, rows, data){
                cb(null, pstation);
            });
        },
        //save
        function(pstation, cb)
        {
            stationTable.save({id:digestUtil.createUUID(), code:"Q0003", balance:1000000, stationType:prop.stationType.channel,
            status:prop.stationStatus.open, secretKey:'cad6011f5f174a359d9a36e06aada07e'}, function(err, rows, data){
                cb(null, pstation, data);
            });

        },
        //save the game
        function(pstation, station, cb)
        {
            var stationGame = mcpdb.get("stationgame");
            stationGame.save({id:digestUtil.createUUID(), stationId:station.id, gameCode:'F01',
                relayToId:pstation.id, rFactor:100, pFactor:9000}, function(err, rows, data){
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

ResetMcpDatabase.prototype.getPrizeDesc = function(gameCode)
{
    var pd;
    if(gameCode == 'T01')
    {
        pd = {"grades":[{"id":"48d7ad96c2c04c8db66f819be96b805c","gameCode":"T01","code":"LV1","name":"一等奖","gLevel":1,"bonus":400000000,"status":1,"gCount":0,"fixedBonus":false},{"id":"5ff778526aa146a885979789ffeae64a","gameCode":"T01","code":"LV2","name":"二等奖","gLevel":2,"bonus":200000000,"status":1,"gCount":0,"fixedBonus":false},{"id":"2c3c4acfdda54ad58a7a2018ef88b921","gameCode":"T01","code":"LV3","name":"三等奖","gLevel":3,"bonus":100000000,"status":1,"gCount":0,"fixedBonus":false},{"id":"d26e90853fad4c1381bb109ad20ac773","gameCode":"T01","code":"LV4","name":"四等奖","gLevel":4,"bonus":20000,"status":1,"gCount":0,"fixedBonus":true},{"id":"08e957d15df34145940024908a10cec9","gameCode":"T01","code":"LV5","name":"五等奖","gLevel":5,"bonus":1000,"status":1,"gCount":0,"fixedBonus":true},{"id":"8bf25c08a5eb498dbeffe83b8d00ead4","gameCode":"T01","code":"LV6","name":"六等奖","gLevel":6,"bonus":500,"status":1,"gCount":0,"fixedBonus":true},{"id":"5cbdd29cded94a7da01f1997e7452523","gameCode":"T01","code":"LV7","name":"一等奖追加","gLevel":7,"bonus":240000000,"status":1,"gCount":0,"fixedBonus":false},{"id":"a007f339ce3841159d6420ad1b86d288","gameCode":"T01","code":"LV8","name":"二等奖追加","gLevel":8,"bonus":120000000,"status":1,"gCount":0,"fixedBonus":false},{"id":"abb64ff7bbce40deaecfb4cd58d32943","gameCode":"T01","code":"LV9","name":"三等奖追加","gLevel":9,"bonus":60000000,"status":1,"gCount":0,"fixedBonus":false},{"id":"3d3a66cc55c04d27961e14fe1fcc58f6","gameCode":"T01","code":"LV10","name":"四等奖追加","gLevel":10,"bonus":10000,"status":1,"gCount":0,"fixedBonus":true},{"id":"9b423e5cf0c84e1d91983e74d66ca939","gameCode":"T01","code":"LV11","name":"五等奖追加","gLevel":11,"bonus":500,"status":1,"gCount":0,"fixedBonus":true}]};
    }
    else if(gameCode == 'F01')
    {
        pd = {"grades":[{"id":"1e72bcdc126c4a90892cf3ede5f7db1e","gameCode":"F01","code":"LV1","name":"一等奖","gLevel":1,"bonus":400000000,"status":1,"gCount":0,"fixedBonus":false},{"id":"debd98b56c3b419b8e54d86eab97db6e","gameCode":"F01","code":"LV2","name":"二等奖","gLevel":2,"bonus":100000000,"status":1,"gCount":0,"fixedBonus":false},{"id":"7d0df599b39b4f748fb33c34395a36d3","gameCode":"F01","code":"LV3","name":"三等奖","gLevel":3,"bonus":300000,"status":1,"gCount":0,"fixedBonus":true},{"id":"3d47d00a3a3c42deb4c873c325055d08","gameCode":"F01","code":"LV4","name":"四等奖","gLevel":4,"bonus":20000,"status":1,"gCount":0,"fixedBonus":true},{"id":"657c184d94564f2e87fda712b08dcf26","gameCode":"F01","code":"LV5","name":"五等奖","gLevel":5,"bonus":1000,"status":1,"gCount":0,"fixedBonus":true},{"id":"aa42f0e75aca439191109a86d1e0bfad","gameCode":"F01","code":"LV6","name":"六等奖","gLevel":6,"bonus":500,"status":1,"gCount":0,"fixedBonus":true}]};
    }
    return JSON.stringify(pd);
};


mcpdb.create(function(){
    var reset = new ResetMcpDatabase();
    reset.resetF01();
    reset.resetStation();
});

