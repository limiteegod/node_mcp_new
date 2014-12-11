var async = require('async');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var log = esut.log;

var dao = require('mcp_dao');
var dc = dao.dc;

var config = require('mcp_config');
var prop = config.prop;

var cons = require('mcp_cons');
var userType = cons.userType;

var run = function()
{
    async.waterfall([
        function(cb){
            dc.init(function(err){
                cb(err);
            });
        },
        function(cb)
        {
            var operationTable = dc.main.get("operation");
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_POPEDOM', name:'权限管理', url:'', hasChildren:1, parent:''}, [], function(err, data){
                log.info(err);
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_ADD_OPERATION', parent:'ADMIN_POPEDOM', name:'新增菜单', url:'admin_addOperation.html'}, [], function(err, data){
                    log.info(err);
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_USER_OPERATION', parent:'ADMIN_POPEDOM', name:'用户权限', url:'admin_setOperation.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_OPERATION', parent:'ADMIN_POPEDOM', name:'权限列表', url:'admin_listOperation.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_GAME', name:'游戏管理', url:'', hasChildren:1, parent:''}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_GAME', parent:'ADMIN_GAME', name:'游戏列表', url:'game_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_TERM', parent:'ADMIN_GAME', name:'期次列表', url:'term_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_DB_GAME', parent:'ADMIN_GAME', name:'游戏(DB)', url:'game_dblist.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_SALE', name:'销售管理', url:'', hasChildren:1, parent:''}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_ORDER', parent:'ADMIN_SALE', name:'订单列表', url:'order_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_TICKET', parent:'ADMIN_SALE', name:'票据列表', url:'ticket_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_DRAW_TICKET', parent:'ADMIN_SALE', name:'算奖队列', url:'ticket_drawList.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_SUC_TICKET', parent:'ADMIN_SALE', name:'成功队列', url:'ticket_sucList.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_TERM_SALE', parent:'ADMIN_SALE', name:'期次报表', url:'term_saleReport.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_STATION', name:'机构管理', url:'', hasChildren:1, parent:''}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_STATION', parent:'ADMIN_STATION', name:'机构列表', url:'station_list.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_ACCOUNT', name:'账户管理', url:'', hasChildren:1, parent:''}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_MONEYLOG', parent:'ADMIN_ACCOUNT', name:'账户流水', url:'moneylog_list.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_LIST_ACCOUNTCFG', parent:'ADMIN_ACCOUNT', name:'系统科目', url:'moneylog_subjectList.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_PRINT', name:'出票管理', url:'', hasChildren:1, parent:''}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_PRINT_ORDER_QUEEN', parent:'ADMIN_PRINT', name:'订单队列', url:'print_list.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_NOTIFY', name:'通知管理', url:'', hasChildren:1, parent:''}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_NOTIFY_CHANNEL', parent:'ADMIN_NOTIFY', name:'通知渠道', url:'notify_chList.html', hasChildren:0}, [], function(err, data){
                });
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_NOTIFY_LIST', parent:'ADMIN_NOTIFY', name:'通知列表', url:'notify_list.html', hasChildren:0}, [], function(err, data){
                });
            });
            operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_SYSTEM', name:'系统维护', url:'', hasChildren:1, parent:''}, [], function(err, data){
                operationTable.save({userType:userType.ADMINISTRATOR, id:'ADMIN_SYSTEM_TERM_SEAL', parent:'ADMIN_SYSTEM', name:'期次封存', url:'term_sealList.html', hasChildren:0}, [], function(err, data){
                });
            });
            cb(null, "success");
        }
    ], function (err, result) {
        log.info(err);
        log.info("end...........");
    });
};

run();
