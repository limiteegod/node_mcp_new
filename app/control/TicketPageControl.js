var esut = require('easy_util');
var dc = require('../config/DbCenter.js');
var prop = require('../config/Prop.js');
var ticketStatus = require('../config/TicketStatus.js');
var game = require('../config/Game.js');
var digestUtil = esut.digestUtil;
var log = esut.log;
var pageUtil = esut.pageUtil;
var async = require('async');

var TicketPageControl = function(){};

TicketPageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[1]](headNode, bodyNode, cb);
};


TicketPageControl.prototype.detail = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"票据详情"};
    var table = dc.main.get("tticket");
    table.findOne({id:bodyNode.id}, {}, [], function(err, data){
        var set = data;
        set.status = ticketStatus.getInfoById(set.status);
        set.game = game.getInfo(set.gameCode);
        set.playType = game.getInfo(set.gameCode, set.playTypeCode);
        set.betType = game.getInfo(set.gameCode, set.playTypeCode, set.betTypeCode);
        backBodyNode.rst = data;
        cb(err, backBodyNode);
    }, {dateToString:true});
};


TicketPageControl.prototype.list = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"票据查询"};
    if(bodyNode.sort == undefined)
    {
        backBodyNode.sort = {createTime:0};
    }
    pageUtil.parse(bodyNode, backBodyNode);
    backBodyNode.games = game.getInfo();
    backBodyNode.ticketStatus = ticketStatus.getInfoById();
    var table = dc.main.get("tticket");
    var cursor = table.find(backBodyNode.cond, {}, []).sort(backBodyNode.sort).limit(backBodyNode.skip, backBodyNode.limit);
    cursor.dateToString();
    cursor.toArray(function(err, data){
        log.info(err);
        for(var key in data)
        {
            var set = data[key];
            set.status = ticketStatus.getInfoById(set.status);
            set.game = game.getInfo(set.gameCode);
            set.playType = game.getInfo(set.gameCode, set.playTypeCode);
            set.betType = game.getInfo(set.gameCode, set.playTypeCode, set.betTypeCode);
        }
        backBodyNode.rst = data;
        backBodyNode.count = cursor.count(function(err, count){
            backBodyNode.count = count;
            cb(null, backBodyNode);
        });
    });
};

module.exports = new TicketPageControl();