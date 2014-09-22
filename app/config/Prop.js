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

var zzc = {};
if(target == 'dev' || target == 'home')
{
    //mysql连接
    var mysql = {'host':'localhost', 'user':'root', 'password':'123456', 'port':3306, 'database':'node'};
    exports.mysql = mysql;

    var mcpdb = {'host':'localhost', 'user':'root', 'password':'123456', 'port':3306, 'database':'mcp'};
    exports.mcpdb = mcpdb;

    //mongodb的地址
    var mongo = {'url':'mongodb://127.0.0.1:27017/print'};
    exports.mongo = mongo;

    //平台地址
    var platform = {};
    platform.site = {
        hostname: '127.0.0.1',
        port: 8080,
        path: '/mcp-filter/main/interface.htm',
        method: 'POST'
    };
    platform.ver = "s.1.01";
    exports.platform = platform;


    zzc.site = {
        hostname: '122.0.68.5',
        port: 8046,
        path: '/greatwallweb/main',
        method: 'POST'
    };
    zzc.key = 'hy123456';
    zzc.partnerid = '008611';
    zzc.version = '1.0';
    zzc.dateFmt = 'YYYYMMDDHHmmss';
    zzc.user = {};
    zzc.user.idCard = '130123198907250098';
    zzc.user.userId = '008611';
    zzc.user.phone = '18612100000';
    zzc.user.realname = 'jiuge';
}
if(target == 'test')
{
    //平台地址
    var platform = {};
    platform.site = {
        hostname: '182.254.139.133',
        port: 8080,
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

exports.zzc = zzc;

//if user hasn't operation in half a hour, the key will be expired.
exports.loginExpiredSeconds = 30*60;

//machine status
exports.machineStatus = {"running":1, "unknown":-1, "stopped":0};

//ticket status
exports.ticketStatus = {"received":1000, "send":2000, "send_failure":2500, "send_success":2800, "success":3000, "failure":4000};

//ticket status
exports.ticketStatusArray = [{id:1000, code:'received', des:"received"}, {id:2000, code:'send', des:"send"},
    {id:2500, code:'send_failure', des:"send_failure"},
    {id:2800, code:'send_success', des:"send_success"},
    {id:3000, code:'success', des:"success"},
    {id:4000, code:'failure', des:"failure"}];

exports.getEnumById = function(name, id)
{
    var self = this;
    var array = self[name];
    for(var key in array)
    {
        if(array[key].id == id)
        {
            return array[key];
        }
    }
};

//game type
exports.gameType = {'normal':1, 'gaopin':2, 'jingcai':3};

//station type
exports.stationType = {'channel':2, 'center':1};

//station status
exports.stationStatus = {'open':0, 'close':1};

//station game status
exports.stationGameStatus = {'open':0, 'close':1};

module.exports = exports;




