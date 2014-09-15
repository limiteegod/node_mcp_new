var db = require('../config/Database.js');
var digestUtil = require("../util/DigestUtil.js");

var MonitorPageControl = function(){};

MonitorPageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[1]](headNode, bodyNode, cb);
};


MonitorPageControl.prototype.client = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"client"};
    var machineTable = db.get("machine");
    machineTable.find({}, {ip:1}).toArray(function(err, data){
        backBodyNode.rst = data;
        cb(null, backBodyNode);
    });
};

var monitorPageControl = new MonitorPageControl();
module.exports = monitorPageControl;