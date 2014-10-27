//var esdb = require('easy_db');
var target = 'dev';
var exports = {};

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

exports.kvs = kvs;

var zzc = {};
//platform
var platform = {};
//oracle
var oracle;
var mcpmg;
if(target == 'dev' || target == 'home')
{
    //平台地址
    platform.site = {
        hostname: '127.0.0.1',
        port: 9090,
        path: '/mcp-filter/main/interface.htm',
        method: 'POST'
    };
    platform.ver = "s.1.01";
    platform.gateways = [{host:'127.0.0.1', port:8080, method:'POST'}];

    exports.platform = platform;
}
if(target == 'test')
{
    //平台地址
    platform.site = {
        hostname: '182.254.139.133',
        port: 8080,
        path: '/mcp-filter/main/interface.htm',
        method: 'POST'
    };
    platform.ver = "s.1.01";
    platform.gateways = [{host:'127.0.0.1', port:8080, method:'POST'}];
    exports.platform = platform;
}
if(target == 'yun')
{
    //平台地址
    platform.site = {
        hostname: '182.254.129.17',
        port: 9090,
        path: '/mcp-filter/main/interface.htm',
        method: 'POST'
    };
    platform.ver = "s.1.01";
    platform.gateways = [{host:'127.0.0.1', port:8081, method:'POST'}];
    exports.platform = platform;
}
else if(target == 'run')
{
    //平台地址
    platform.site = {
        hostname: '127.0.0.1',
        port: 8081,
        path: '/mcp-filter/main/interface.htm',
        method: 'POST'
    };
    platform.ver = "s.1.01";
    platform.gateways = [{host:'192.168.222.233', port:8501, method:'POST'},
        {host:'192.168.222.232', port:8401, method:'POST'}
    ];
    exports.platform = platform;
}
exports.zzc = zzc;
exports.oracle = oracle;
exports.mcpmg = mcpmg;

//if user hasn't operation in half a hour, the key will be expired.
exports.loginExpiredSeconds = 30*60;

//machine status
exports.machineStatus = {"running":1, "unknown":-1, "stopped":0};

//print status
exports.printStatus = {"success":0, "failure":1};

//print status
exports.printStatusArray = [{id:0, code:'success', des:"打印成功"},
    {id:1, code:'failure', des:"打印失败"}];

//scheme type
exports.schemeType = {"none":1, "follow":2};
//scheme type
exports.schemeTypeArray = [{id:1, code:'none', des:"无方案"},
    {id:2, code:'follow', des:"追号"}];

//pay type
exports.payType = {"company":0, "cash":1};
//pay type
exports.payTypeArray = [{id:0, code:'company', des:"第三方支付"},
    {id:1, code:'cash', des:"现金支付"}];

//order type
exports.orderType = {"customer":0, "channel":1};
//order type
exports.orderTypeArray = [{id:0, code:'customer', des:"普通用户"},
    {id:1, code:'channel', des:"渠道"}];


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

exports.userType = {"GUEST":0, "CUSTOMER":1, "CHANNEL":2, "ADMINISTRATOR":3};
exports.userTypeArray = [{id:0, code:'GUEST', des:"游客"},
    {id:1, code:'CUSTOMER', des:"普通用户"},
    {id:2, code:'CHANNEL', des:"渠道用户"},
    {id:3, code:'ADMINISTRATOR', des:"系统管理员"}];

//暂时支持3种密钥来源
exports.digestFromType = {"NONE":0, "DB":1, "CACHE":2};
exports.digestFromTypeArray = [
    {id:0, code:'NONE', des:"无"},
    {id:1, code:'DB', des:"数据库"},
    {id:2, code:'CACHE', des:"缓存"}
];

/**
 * 数据库配置信息，
 * config，数据库的连接信息
 * type，类型，暂时支持oracle，mysql，mongodb三种类型
 * dateToLong，ture，则在生成表的时候，会把date类型映射为long类型
 */
var dbs = [{
    //本地开发环境
    config:{
        'host':'localhost',
        'user':'root',
        'password':'123456',
        'port':3306,
        'database':'mcp'
    },
    //type:esdb.prop.dbType.mysql,
    dateToLong:false
}, {
    //oracle dev
    config:{
        hostname: "192.168.11.118",
        port: 1521,
        database: "lottery", // System ID (SID)
        user: "liming",
        password: "0okmnhy6"
    }
    //type:esdb.prop.dbType.oracle
}, {
    //dev
    config:{'url':'mongodb://127.0.0.1:27017/mcp'}
    //type:esdb.prop.dbType.mongodb
}, {
    //run
    config:{'url':'mongodb://192.168.222.233:27017/mcp'}
    //type:esdb.prop.dbType.mongodb
}, {
    //yun test
    config:{
        'host':'10.131.172.66',
        'user':'root',
        'password':'0okmnhy6',
        'port':3306,
        'database':'mcp'
    },
    //type:esdb.prop.dbType.mysql,
    dateToLong:false
}, {
    //yun test
    config:{'url':'mongodb://10.131.172.66:27017/mcp'}
    //type:esdb.prop.dbType.mongodb
}];
exports.dbs = dbs;

module.exports = exports;




