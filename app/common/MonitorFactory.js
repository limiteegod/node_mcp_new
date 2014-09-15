var monitorControl = require("../control/MonitorControl.js");

var MonitorFactory = function(){};

MonitorFactory.prototype.handle = function(cmdDataBuf, cb)
{
    var msgStr;
    if(typeof cmdDataBuf == "string")
    {
        msgStr = cmdDataBuf;
    }
    else
    {
        msgStr = cmdDataBuf.toString("utf8");
    }
    console.log(msgStr);
    var msgNode = JSON.parse(msgStr);
    var headNode = msgNode.head;
    var bodyStr = msgNode.body;

    var cmdGroup = headNode.cmd.match(/^([A-Z]+)([0-9]{1,})$/);
    if(cmdGroup[1] == "MT")
    {
        monitorControl.handle(headNode, bodyStr, cb);
    }
};

module.exports = new MonitorFactory();