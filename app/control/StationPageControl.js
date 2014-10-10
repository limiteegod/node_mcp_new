var dc = require('../config/DbCenter.js');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;

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

var stationPageControl = new StationPageControl();
module.exports = stationPageControl;