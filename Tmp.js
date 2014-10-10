var async = require('async');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var dc = require('./app/config/DbCenter.js');
var prop = require('./app/config/Prop.js');
var log = esut.log;


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
        operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_TERM', name:'期次管理', url:'', hasChildren:1}, [], function(err, data){
            operationTable.save({userType:prop.userType.ADMINISTRATOR, id:'ADMIN_LIST_TERM', parent:'ADMIN_TERM', name:'期次列表', url:'term_list.html', hasChildren:0}, [], function(err, data){
            });
        });
        cb(null, "success");
    }
], function (err, result) {
    log.info(err);
    log.info("end...........");
});
