var esut = require('easy_util');
var dc = require('../config/DbCenter.js');
var prop = require('../config/Prop.js');
var digestUtil = esut.digestUtil;
var log = esut.log;
var pageUtil = esut.pageUtil;
var async = require('async');

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
            set.game = prop.getGameInfo(set.gameCode);
            set.status = prop.getEnumById('termStatusArray', set.status);
        }
        backBodyNode.rst = data;
        backBodyNode.count = cursor.count(function(err, count){
            backBodyNode.count = count;
            cb(null, backBodyNode);
        });
    });
};

module.exports = new TermPageControl();