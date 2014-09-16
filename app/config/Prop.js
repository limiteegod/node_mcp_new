var target = 'dev';

var argv = process.argv;
var kvs = {};
for(var key in argv)
{
    if(key > 1)
    {
        var kv = argv[key].split("=");
        kvs[kv[0]] = kv[1];
    }
}
if(kvs.target)
{
    target = kvs.target;
}

//runtime target
exports.target = target;

if(target == 'dev')
{
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
}
else if(target == 'run')
{
    //mysql连接
    var mysql = {'host':'192.168.222.234', 'user':'root', 'password':'0okmnhy6', 'port':3306, 'database':'node'};
    exports.mysql = mysql;

    //mongodb的地址
    var mongo = {'url':'mongodb://192.168.222.233:27017/test'};
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
}

//if user hasn't operation in half a hour, the key will be expired.
exports.loginExpiredSeconds = 30*60;

//machine status
exports.machineStatus = {"running":1, "unknown":-1, "stopped":0};




