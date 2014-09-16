var db = require('../config/Database.js');
var digestUtil = require("../util/DigestUtil.js");

var AngularPageControl = function(){};

AngularPageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[1]](headNode, bodyNode, cb);
};


AngularPageControl.prototype.index = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"angularjs"};
    cb(null, backBodyNode);
};

AngularPageControl.prototype.index0 = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"angularjs"};
    cb(null, backBodyNode);
};

AngularPageControl.prototype.index1 = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"angularjs"};
    cb(null, backBodyNode);
};

AngularPageControl.prototype.machine = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"machine"};
    cb(null, backBodyNode);
};

var angularPageControl = new AngularPageControl();
module.exports = angularPageControl;