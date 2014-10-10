var monitorControl = require("./MonitorControl.js");
var printControl = require("./PrintControl.js");
var tradeControl = require("./TradeControl.js");
var stationControl = require("./StationControl.js");
var adminControl = require("./AdminControl.js");
var prop = require('../config/Prop.js');
var ec = require('../config/ErrCode.js');

var CmdFactory = function(){};

CmdFactory.prototype.handle = function(headNode, bodyStr, cb)
{
    var cmdGroup = headNode.cmd.match(/^([A-Z]+)([0-9]{1,})$/);
    if(cmdGroup[1] == "MT")
    {
        monitorControl.handle(headNode, bodyStr, cb);
    }
    else if(cmdGroup[1] == "P")
    {
        printControl.handle(headNode, bodyStr, cb);
    }
    else if(cmdGroup[1] == "T")
    {
        tradeControl.handle(headNode, bodyStr, cb);
    }
    else if(cmdGroup[1] == "ST")
    {
        tradeControl.handle(headNode, bodyStr, cb);
    }
    else if(cmdGroup[1] == "AD")
    {
        adminControl.handle(headNode, bodyStr, cb);
    }
    else
    {
        cb(ec.E2060);
    }
};

var cmdFactory = new CmdFactory();
module.exports = cmdFactory;