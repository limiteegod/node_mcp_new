var esut = require('easy_util');
var dc = require('../config/DbCenter.js');
var prop = require('../config/Prop.js');
var orderStatus = require('../config/OrderStatus.js');
var game = require('../config/Game.js');
var digestUtil = esut.digestUtil;
var log = esut.log;
var pageUtil = esut.pageUtil;
var async = require('async');

var OrderPageControl = function(){};

OrderPageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[1]](headNode, bodyNode, cb);
};

OrderPageControl.prototype.detail = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"订单详情"};
    var table = dc.main.get("torder");
    table.findOne({id:bodyNode.id}, {}, [], function(err, data){
        var set = data;
        set.status = orderStatus.getInfoById(set.status);
        set.game = game.getInfo(set.gameCode);
        backBodyNode.rst = data;
        cb(err, backBodyNode);
    }, {dateToString:true});
};


OrderPageControl.prototype.list = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"订单查询"};
    if(bodyNode.sort == undefined)
    {
        backBodyNode.sort = {createTime:0};
    }
    pageUtil.parse(bodyNode, backBodyNode);
    backBodyNode.games = game.getInfo();
    backBodyNode.orderStatus = orderStatus.getInfoById();
    var table = dc.main.get("torder");
    var cursor = table.find(backBodyNode.cond, {}, []).sort(backBodyNode.sort).limit(backBodyNode.skip, backBodyNode.limit);
    cursor.dateToString();
    cursor.toArray(function(err, data){
        for(var key in data)
        {
            var set = data[key];
            set.status = orderStatus.getInfoById(set.status);
            set.game = game.getInfo(set.gameCode);
        }
        backBodyNode.rst = data;
        backBodyNode.count = cursor.count(function(err, count){
            backBodyNode.count = count;
            cb(null, backBodyNode);
        });
    });
};

module.exports = new OrderPageControl();