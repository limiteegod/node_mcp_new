var async = require('async');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var dc = require('./app/config/DbCenter.js');
var prop = require('./app/config/Prop.js');
var log = esut.log;


var addOperation = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            var operationTable = dc.main.get("operation");
            operationTable.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var operationTable = dc.main.get("operation");
            operationTable.create(function(err, data){
                cb(err);
            });
        },
        function(cb){
            var table = dc.main.get("admini");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("admini");
            table.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            var table = dc.main.get("admini");
            table.save({id:digestUtil.createUUID(), name:"admin", password:"123456"}, [], function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            var operationTable = dc.main.get("operation");
            operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_POPEDOM', name:'权限管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_ADD_OPERATION', parent:'ADMIN_POPEDOM', name:'新增菜单', url:'admin_addOperation.html'}, [], function(err, data){
                });
                operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_USER_OPERATION', parent:'ADMIN_POPEDOM', name:'用户权限', url:'admin_setOperation.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_LIST_OPERATION', parent:'ADMIN_POPEDOM', name:'权限列表', url:'admin_listOperation.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_GAME', name:'游戏管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_LIST_GAME', parent:'ADMIN_GAME', name:'游戏列表', url:'game_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_LIST_TERM', parent:'ADMIN_GAME', name:'期次列表', url:'term_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_LIST_DB_GAME', parent:'ADMIN_GAME', name:'游戏(DB)', url:'game_dblist.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_SALE', name:'销售管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_LIST_ORDER', parent:'ADMIN_SALE', name:'订单列表', url:'order_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_LIST_TICKET', parent:'ADMIN_SALE', name:'票据列表', url:'ticket_list.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_STATION', name:'机构管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_LIST_STATION', parent:'ADMIN_STATION', name:'机构列表', url:'station_list.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_ACCOUNT', name:'账户管理', url:'', hasChildren:1}, [], function(err, data){
                operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_LIST_MONEYLOG', parent:'ADMIN_ACCOUNT', name:'账户流水', url:'moneylog_list.html', hasChildren:0}, [], function(err, data){
                });
            });
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

var initOrder = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            var table = dc.main.get("torder");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("torder");
            table.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

var initTicket = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            var table = dc.main.get("tticket");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("tticket");
            table.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

var initTerm = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            var table = dc.main.get("term");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("term");
            table.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

var initMoneyLog = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb){
            var table = dc.main.get("moneylog");
            table.drop(function(err, data){
                cb(null);
            });
        },
        function(cb)
        {
            var table = dc.main.get("moneylog");
            table.create(function(err, data){
                cb(err);
            });
        },
        function(cb)
        {
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

addOperation();
