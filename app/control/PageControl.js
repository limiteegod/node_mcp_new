var dc = require('../config/DbCenter.js');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var adminPageControl = require("./AdminPageControl.js");
var monitorPageControl = require("./MonitorPageControl.js");
var testPageControl = require("./TestPageControl.js");
var angularPageControl = require("./AngularPageControl.js");

var PageControl = function(){};

PageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[0]](headNode, bodyNode, cb);
};


PageControl.prototype.admin = function(headNode, bodyNode, cb)
{
    adminPageControl.handle(headNode, bodyNode, cb);
};

PageControl.prototype.test = function(headNode, bodyNode, cb)
{
    testPageControl.handle(headNode, bodyNode, cb);
};

PageControl.prototype.monitor = function(headNode, bodyNode, cb)
{
    monitorPageControl.handle(headNode, bodyNode, cb);
};

PageControl.prototype.angular = function(headNode, bodyNode, cb)
{
    angularPageControl.handle(headNode, bodyNode, cb);
};

var pageControl = new PageControl();
module.exports = pageControl;