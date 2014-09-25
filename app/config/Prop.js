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
if(target == 'dev' || target == 'home')
{
    //mysql连接
    var mysql = {'host':'localhost', 'user':'root', 'password':'123456', 'port':3306, 'database':'node'};
    exports.mysql = mysql;

    var mcpdb = {'host':'localhost', 'user':'root', 'password':'123456', 'port':3306, 'database':'mcp'};
    exports.mcpdb = mcpdb;

    oracle = {
        hostname: "192.168.11.118",
        port: 1521,
        database: "lottery", // System ID (SID)
        user: "liming",
        password: "0okmnhy6"
    };

    //mongodb的地址
    var mongo = {'url':'mongodb://127.0.0.1:27017/print'};
    exports.mongo = mongo;

    //平台地址
    platform.site = {
        hostname: '127.0.0.1',
        port: 9080,
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
    //mysql连接
    var mysql = {'host':'192.168.222.234', 'user':'root', 'password':'0okmnhy6', 'port':3306, 'database':'node'};
    exports.mysql = mysql;

    //mongodb的地址
    var mongo = {'url':'mongodb://192.168.222.233:27017/test'};
    exports.mongo = mongo;

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



console.log(exports.platform);

exports.zzc = zzc;
exports.oracle = oracle;

//if user hasn't operation in half a hour, the key will be expired.
exports.loginExpiredSeconds = 30*60;

//machine status
exports.machineStatus = {"running":1, "unknown":-1, "stopped":0};

//ticket status
exports.ticketStatus = {"received":1000, "send":2000, "send_failure":2500, "send_success":2800, "success":3000, "failure":4000};

//ticket status
exports.ticketStatusArray = [{id:1000, code:'received', des:"已经接收"}, {id:2000, code:'send', des:"正在发送"},
    {id:2500, code:'send_failure', des:"发送失败"},
    {id:2800, code:'send_success', des:"发送成功"},
    {id:3000, code:'success', des:"出票成功"},
    {id:4000, code:'failure', des:"出票失败"}];

exports.games =
[
    {id:'F01', name:'双色球', playTypes:
        [
            {id:'00', name:'普通', betTypes:
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

//game type
exports.gameType = {'normal':1, 'gaopin':2, 'jingcai':3};

//station type
exports.stationType = {'channel':2, 'center':1};

//station status
exports.stationStatus = {'open':0, 'close':1};

//station game status
exports.stationGameStatus = {'open':0, 'close':1};

module.exports = exports;




