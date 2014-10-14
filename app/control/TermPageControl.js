var esut = require('easy_util');
var dc = require('../config/DbCenter.js');
var prop = require('../config/Prop.js');
var dateUtil = esut.dateUtil;
var digestUtil = esut.digestUtil;
var log = esut.log;
var pageUtil = esut.pageUtil;
var async = require('async');
var game = require('../config/Game.js');
var termStatus = require('../config/TermStatus.js');

var TermPageControl = function(){};

TermPageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[1]](headNode, bodyNode, cb);
};

TermPageControl.prototype.list = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"view terms"};
    pageUtil.parse(bodyNode, backBodyNode);
    var termTable = dc.main.get("term");
    var cursor = termTable.find(backBodyNode.cond, {}, []).sort(backBodyNode.sort).limit(backBodyNode.skip, backBodyNode.limit);
    cursor.toArray(function(err, data){
        for(var key in data)
        {
            var set = data[key];
            dateUtil.mysqlObj(termTable, set);
            set.game = game.getInfo(set.gameCode);
            set.status = termStatus.getInfoById(set.status);
        }
        backBodyNode.rst = data;
        backBodyNode.count = cursor.count(function(err, count){
            backBodyNode.count = count;
            cb(null, backBodyNode);
        });
    });
};

TermPageControl.prototype.add = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"view terms"};
    backBodyNode.game = game.getInfo();
    backBodyNode.termStatus = termStatus.getInfoById();
    backBodyNode.curTime = dateUtil.getCurTime();
    cb(null, backBodyNode);
};

module.exports = new TermPageControl();