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
        port: 9081,
        path: '/mcp-filter/main/interface.htm',
        method: 'POST'
    };
    platform.ver = "s.1.01";
    platform.gateway = {host:'127.0.0.1', port:8080, method:'POST'};

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
    platform.gateway = {host:'127.0.0.1', port:8080, method:'POST'};
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
    platform.gateway = {host:'192.168.222.233', port:8301, method:'POST'};
    exports.platform = platform;
}
exports.zzc = zzc;
exports.oracle = oracle;
exports.mcpmg = mcpmg;

//if user hasn't operation in half a hour, the key will be expired.
exports.loginExpiredSeconds = 30*60;

//machine status
exports.machineStatus = {"running":1, "unknown":-1, "stopped":0};

//ticket status
exports.ticketStatus = {"init":1000, "waiting_pay":1080, "presale":1090,
    "waiting_print":1100, "take_away":1200, "print_success":1300, "print_failure":1500};

//ticket status
exports.ticketStatusArray = [{id:1000, code:'init', des:"初始状态"},
    {id:1080, code:'waiting_pay', des:"等待支付"},
    {id:1090, code:'presale', des:"预售"},
    {id:1100, code:'waiting_print', des:"等待打印"},
    {id:1200, code:'take_away', des:"程序取走"},
    {id:1300, code:'print_success', des:"打印成功"},
    {id:1500, code:'print_failure', des:"打印失败"}];

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

//order status
exports.orderStatus = {"init":1000, "presale":1001, "waiting_print":1100,
    "success":1200, "partial_success":1300};
//order status
exports.orderStatusArray = [{id:1000, code:'init', des:"初始状态"},
    {id:1001, code:'presale', des:"预售"},
    {id:1100, code:'waiting_print', des:"等待出票"},
    {id:1200, code:'success', des:"出票成功"},
    {id:1300, code:'partial_success', des:"部分出票成功"}];

exports.games =
[
    {id:'F01', name:'双色球', playTypes:
        [
            {id:'00', name:'普通', price:200, betTypes:
                [
                    {id:'00', name:'单式'},
                    {id:'01', name:'复式'},
                    {id:'02', name:'胆拖'}
                ]
            }
        ]
    }
];

//init the game tree
for(var key in exports.games)
{
    var game = exports.games[key];
    exports.games[game.id] = game;
    for(var pKey in game.playTypes)
    {
        var playType = game.playTypes[pKey];
        playType.parent = game;
        game[playType.id] = playType;

        for(var bkey in playType.betTypes)
        {
            var betType = playType.betTypes[bkey];
            betType.parent = playType;
            playType[betType.id] = betType;
        }
    }
};

/**
 * get the game info
 * @param gameCode
 * @param playTypeCode
 * @param betTypeCode
 * @returns {*}
 */
exports.getGameInfo = function(gameCode, playTypeCode, betTypeCode)
{
    var self = this;
    var obj;
    if(gameCode)
    {
        obj = self.games[gameCode];
    }
    if(playTypeCode)
    {
        obj = obj[playTypeCode];
    }
    if(betTypeCode)
    {
        obj = obj[betTypeCode];
    }
    return obj;
};

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

exports.dbType = {"mysql":0, "oracle":1, "mongodb":2};
exports.dbTypeArray = [{id:0, code:'mysql', des:"mysql"},
    {id:1, code:'oracle', des:"oracle"},
    {id:2, code:'mongodb', des:"mongodb"}];


//game type
exports.gameType = {'normal':1, 'gaopin':2, 'jingcai':3};

//station type
exports.stationType = {'channel':2, 'center':1};

//station status
exports.stationStatus = {'open':0, 'close':1};

//station game status
exports.stationGameStatus = {'open':0, 'close':1};

exports.termStatus = {'INIT':1000, 'NOT_ON_SALE':1100, 'PRE_ON_SALE':1150, 'ON_SALE':1200};

exports.termStatusArray = [{id:1000, code:'INIT', des:'初始状态'},
    {id:1100, code:'NOT_ON_SALE', des:'未开售'},
    {id:1150, code:'PRE_ON_SALE', des:'准备开售中'},
    {id:1200, code:'ON_SALE', des:'正在销售'}];

//config db basic type
var dbs = [{
    config:{
        'host':'localhost',
        'user':'root',
        'password':'123456',
        'port':3306,
        'database':'mcp'
    },
    type:exports.dbType.mysql
}, {
    config:{
        hostname: "192.168.11.118",
        port: 1521,
        database: "lottery", // System ID (SID)
        user: "liming",
        password: "0okmnhy6"
    },
    type:exports.dbType.oracle
}, {
    config:{'url':'mongodb://127.0.0.1:27017/mcp'},
    type:exports.dbType.mongodb
}];
exports.dbs = dbs;

module.exports = exports;




