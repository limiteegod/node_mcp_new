//mysql连接
var mysql = {'host':'localhost', 'user':'root', 'password':'123456', 'port':3306, 'database':'node'};
exports.mysql = mysql;

//mongodb的地址
var mongo = {'url':'mongodb://127.0.0.1:27017/test'};
exports.mongo = mongo;

//平台地址
var platform = {};
platform.site = {
    hostname: '127.0.0.1',
    port: 8081,
    path: '/mcp-filter/main/interface.htm',
    method: 'POST'
};
platform.ver = "s.1.01";
exports.platform = platform;

//if user hasn't operation in half a hour, the key will be expired.
exports.loginExpiredSeconds = 30*60;


//machine status
exports.machineStatus = {"running":1, "unknown":-1, "stopped":0};



