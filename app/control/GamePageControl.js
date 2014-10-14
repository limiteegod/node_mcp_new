var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var log = esut.log;
var pageUtil = esut.pageUtil;
var dc = require('../config/DbCenter.js');
var game = require('../config/Game.js');

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
    var backBodyNode = {title:"新增投注站"};
    backBodyNode.rst = stationType.getInfoById();
    cb(null, backBodyNode);
};

GamePageControl.prototype.detail = function(headNode, bodyNode, cb)
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

GamePageControl.prototype.list = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"投注站查询"};
    backBodyNode.rst = game.getInfo();
    cb(null, backBodyNode);
};

module.exports = new GamePageControl();