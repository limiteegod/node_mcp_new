var db = require('../config/Database.js');
var digestUtil = require("../util/DigestUtil.js");

var TestPageControl = function(){};

TestPageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[1]](headNode, bodyNode, cb);
};


TestPageControl.prototype.socket = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"socket"};
    cb(null, backBodyNode);
};

TestPageControl.prototype.angularjs = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"angularjs"};
    cb(null, backBodyNode);
};

var testPageControl = new TestPageControl();
module.exports = testPageControl;