var cmdFactory = require("../control/CmdFactory.js");

var MonitorFactory = function(){};

MonitorFactory.prototype.handle = function(cmdDataBuf, cb)
{
    var msgStr = cmdDataBuf.toString("utf8");
    console.log(msgStr);
    var msgNode = JSON.parse(msgStr);
    var headNode = msgNode.head;
    var bodyStr = msgNode.body;
    cmdFactory.handle(headNode, bodyStr, cb);
};

module.exports = new MonitorFactory();