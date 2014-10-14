var dc = require('../config/DbCenter.js');
var stationType = require('../config/StationType.js');
var stationStatus = require('../config/StationStatus.js');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var log = esut.log;
var pageUtil = esut.pageUtil;

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

var stationPageControl = new StationPageControl();
module.exports = stationPageControl;