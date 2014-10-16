var dc = require('../config/DbCenter.js');
var stationType = require('../config/StationType.js');
var stationStatus = require('../config/StationStatus.js');
var stationGameStatus = require('../config/StationGameStatus.js');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var log = esut.log;
var pageUtil = esut.pageUtil;
var game = require('../config/Game.js');
var async = require('async');

var StationPageControl = function(){};

StationPageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[1]](headNode, bodyNode, cb);
};

StationPageControl.prototype.login = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"login", tip:"Welcome to login at my website."};
    cb(null, backBodyNode);
};


StationPageControl.prototype.index = function(headNode, bodyNode, cb)
{
    var self = this;
    cb(null, {});
};

StationPageControl.prototype.top = function(headNode, bodyNode, cb)
{
    var self = this;
    cb(null, {});
};

StationPageControl.prototype.left = function(headNode, bodyNode, cb)
{
    var self = this;
    cb(null, {});
};

StationPageControl.prototype.main = function(headNode, bodyNode, cb)
{
    var self = this;
    cb(null, {});
};

StationPageControl.prototype.add = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"新增投注站"};
    backBodyNode.rst = stationType.getInfoById();
    cb(null, backBodyNode);
};

StationPageControl.prototype.detail = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"投注站详情"};
    backBodyNode.rst = stationType.getInfoById();

    var table = dc.main.get("station");
    table.findOne({id:bodyNode.id}, {}, [], function(err, data){
        backBodyNode.station = data;
        cb(null, backBodyNode);
    });
};

/**
 * 机构销售游戏的详情
 * @param headNode
 * @param bodyNode
 * @param cb
 */
StationPageControl.prototype.detailGame = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"详情"};
    var table = dc.main.get("stationgame");
    async.waterfall([
        //如果id为空，则创建一条记录
        function(cb){
            if(!bodyNode.id || bodyNode.id.length == 0)
            {
                var sg = {id:digestUtil.createUUID(), stationId:bodyNode.stationId,
                    gameCode:bodyNode.gameCode, relayToId:'', earlyStopBufferSimplex:0,
                    earlyStopBufferDuplex:0, status:stationGameStatus.STOP, rFactor:0, pFactor:0};
                table.save(sg, [], function(err, data){
                    cb(null, sg);
                });
            }
            else
            {
                table.findOne({id:bodyNode.id}, {}, [], function(err, data){
                    cb(null, data);
                });
            }
        },
        function(sg, cb){
            log.info(sg);
            var table = dc.main.get("station");
            table.findOne({id:bodyNode.stationId}, {}, [], function(err, data){
                backBodyNode.station = data;
                cb(null, sg);
            });
        },
        function(sg, cb)
        {
            backBodyNode.rst = sg;
            backBodyNode.stationStatus = stationStatus.getInfoById();
            cb(null);
        },
        //获得所有出票中心
        function(cb)
        {
            var table = dc.main.get("station");
            table.find({stationType:stationType.CENTER}, {}).toArray(function(err, data){
                backBodyNode.center = data;
                cb(err);
            });
        }
    ], function (err, result) {
        cb(err, backBodyNode);
    });
};

StationPageControl.prototype.gameList = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"游戏查询"};
    async.waterfall([
        function(cb){
            var table = dc.main.get("station");
            table.findOne({id:bodyNode.id}, {}, [], function(err, data){
                backBodyNode.station = data;
                cb(null);
            });
        },
        function(cb){
            var table = dc.main.get("stationgame");
            table.find({stationId:bodyNode.id}, {}).toArray(function(err, data){
                for(var key in data)
                {
                    var set = data[key];
                    set.status = stationGameStatus.getInfoById(set.status);
                }
                cb(null, data);
            });
        }
        ,
        function(games, cb){
            var table = dc.main.get("station");
            async.each(games, function(game, callback) {
                if(game.relayToId)
                {
                    table.findOne({id:game.relayToId}, {}, [], function(err, data){
                        game.relayToId = data;
                        callback();
                    });
                }
                else
                {
                    game.relayToId = {name:''};
                    callback();
                }
            }, function(err){
                cb(null, games);
            });
        },
        //查看是否有未启用的游戏，如果有，添加在最后
        function(games, cb){
            var info = {};
            for(var key in games)
            {
                var set = games[key];
                info[set.gameCode] = 1;
            }
            log.info(info);
            var allGames = game.getInfo();
            for(var key in allGames)
            {
                var set = allGames[key];
                if(!info[set.id])
                {
                    games[games.length] = {id:'', gameCode:set.id, rFactor:0, pFactor:0,
                    relayToId:{name:''}, status:{des:'不可用'}};
                }
            }
            log.info(games);
            backBodyNode.rst = games;
            cb(null);
        }
    ], function (err, result) {
        cb(err, backBodyNode);
    });
};

StationPageControl.prototype.list = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"投注站查询"};
    if(bodyNode.sort == undefined)
    {
        backBodyNode.sort = {code:1};
    }
    pageUtil.parse(bodyNode, backBodyNode);
    var table = dc.main.get("station");
    var cursor = table.find(backBodyNode.cond, {}, []).sort(backBodyNode.sort).limit(backBodyNode.skip, backBodyNode.limit);
    cursor.dateToString();
    cursor.toArray(function(err, data){
        for(var key in data)
        {
            var set = data[key];
            set.stationType = stationType.getInfoById(set.stationType);
        }
        backBodyNode.rst = data;
        backBodyNode.count = cursor.count(function(err, count){
            backBodyNode.count = count;
            cb(null, backBodyNode);
        });
    });
};

StationPageControl.prototype.select = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"投注站选择"};
    if(bodyNode.sort == undefined)
    {
        backBodyNode.sort = {code:1};
    }
    backBodyNode.select = bodyNode.select;
    pageUtil.parse(bodyNode, backBodyNode);
    var table = dc.main.get("station");
    var cursor = table.find(backBodyNode.cond, {}, []).sort(backBodyNode.sort).limit(backBodyNode.skip, backBodyNode.limit);
    cursor.dateToString();
    cursor.toArray(function(err, data){
        for(var key in data)
        {
            var set = data[key];
            set.stationType = stationType.getInfoById(set.stationType);
        }
        backBodyNode.rst = data;
        backBodyNode.count = cursor.count(function(err, count){
            backBodyNode.count = count;
            cb(null, backBodyNode);
        });
    });
};

var stationPageControl = new StationPageControl();
module.exports = stationPageControl;