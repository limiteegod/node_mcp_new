var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var log = esut.log;
var pageUtil = esut.pageUtil;
var dc = require('../config/DbCenter.js');
var game = require('../config/Game.js');
var gameStatus = require('../config/GameStatus.js');
var gameType = require('../config/GameType.js');

var GamePageControl = function(){};

GamePageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[1]](headNode, bodyNode, cb);
};

GamePageControl.prototype.add = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"新增游戏"};
    backBodyNode.status = gameStatus.getInfoById();
    backBodyNode.type = gameType.getInfoById();
    cb(null, backBodyNode);
};

GamePageControl.prototype.detail = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"期次详情"};
        cb(null, backBodyNode);
};

GamePageControl.prototype.list = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"游戏查询"};
    backBodyNode.rst = game.getInfo();
    cb(null, backBodyNode);
};

GamePageControl.prototype.dblist = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"游戏查询"};
    pageUtil.parse(bodyNode, backBodyNode);
    var table = dc.main.get("game");
    var cursor = table.find(backBodyNode.cond, {}, []).sort(backBodyNode.sort).limit(backBodyNode.skip, backBodyNode.limit);
    cursor.toArray(function(err, data){
        for(var key in data)
        {
            var set = data[key];
            set.status = gameStatus.getInfoById(set.status);
            set.type = gameType.getInfoById(set.type);
        }
        backBodyNode.rst = data;
        backBodyNode.count = cursor.count(function(err, count){
            backBodyNode.count = count;
            cb(null, backBodyNode);
        });
    });
};

module.exports = new GamePageControl();