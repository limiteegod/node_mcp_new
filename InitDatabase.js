var async = require('async');
var db = require('./app/config/Database.js');
var operationTable = db.get("operation");
var userTypeTable = db.get("userType");
var userOperation = db.get("userOperation");

var InitDatabase = function(){};

InitDatabase.prototype.saveUserType = function(data, outerCb){
    var rstArray = new Array();
    async.each(data, function(row, callback) {
        userTypeTable.save(row, function(err, rows, data){
            rstArray[data.code] = data._id;
            callback();
        });
    }, function(err){
        if( err ) {
            console.log('A file failed to process');
        } else {
            outerCb(rstArray);
        }
    });
};

InitDatabase.prototype.saveOneOperation = function(data, cb)
{
    operationTable.save(data, function(err, rows){
        cb({"code":data["code"], "_id":rows.insertId});
        var children = data["children"];
        for(var key in children)
        {
            var child = children[key];
            child["parentId"] = rows.insertId;
            var childFunc = function(child){
                operationTable.save(child, function(err, rows){
                    cb({"code":child["code"], "_id":rows.insertId});
                });
            };
            childFunc(child);
        }
    });
};

InitDatabase.prototype.saveOperation = function(data, cb){
    var self = this;
    var count = 0;
    for(var key in data)
    {
        count++;
        count += data[key]["children"].length;
    }
    var finishedCount = 0;
    var backData = new Array();
    var scb = function(data){
        finishedCount++;
        backData[data.code] = data._id;
        if(finishedCount >= count)
        {
            cb(backData);
        }
    };
    for(var key in data)
    {
        self.saveOneOperation(data[key], scb);
    }
};

var init = new InitDatabase();

async.waterfall([
    //重新创建表结构
    function(cb){
        db.create(function(){
            cb(null);
        });
    },
    //保存可用操作
    function(cb) {
        var operationData = [
            {"name":"权限管理", "code":"manOp", hasChildren:1,
                "children":[
                    {"name":"添加项目", "code":"addOperation", "url":"admin_addOperation.html", hasChildren:0},
                    {"name":"角色权限", "code":"userOperation", "url":"admin_setOperation.html", hasChildren:0}
                ]
            },
            {"name":"期次管理", "code":"manTerm", hasChildren:1,
                "children":[
                    {"name":"在售期次", "code":"termOnSale", "url":"", hasChildren:0},
                    {"name":"期次详情", "code":"termDetail", "url":"", hasChildren:0}
                ]
            }
            ,
            {"name":"用户管理", "code":"manUser", hasChildren:0,
                "children":[]
            }
            ,
            {"name":"订单管理", "code":"manOrder", hasChildren:0,
                "children":[]
            }
        ];
        init.saveOperation(operationData, function(data){
            cb(null, data);
        });
    },
    //保存用户类型
    function(opdata, cb) {
        var userTypeList = [{"name":"游客", "code":"guest", "_id":"guest"},
            {"name":"用户", "code":"user", "_id":"user"},
            {"name":"管理员", "code":"manager", "_id":"manager"}];
        init.saveUserType(userTypeList, function(data){
            cb(null, opdata, data);
        });
    },
    //保存用户可用操作
    function(opdata, typedata, cb) {
        console.log(opdata);
        console.log(typedata);
        var userTypeId = typedata['manager'];
        for(var key in opdata)
        {
            var operationId = opdata[key];
            userOperation.save({"userTypeId":userTypeId, "operationId":operationId});
        }
        cb(null, typedata);
    },
    //保存用户
    function(typedata, cb){
        var userTable = db.get("user");
        userTable.save({"name":"admin", "password":"123456", "userTypeId":typedata["manager"]});
        userTable.save({"name":"liming", "password":"123456", "userTypeId":typedata["user"]});
        cb(null, typedata);
    },
    //系统可用的cmd码
    function(typedata, cb)
    {
        var cmdTable = db.get("cmd");
        cmdTable.save({"code":"A01", "des":"用户登录"});
        cmdTable.save({"code":"A02", "des":"用户查询"});
        cmdTable.save({"code":"admin/login", des:"manager login page"});
        cb(null, typedata);
    },
    //角色可用cmd码对应表
    function(typedata, cb)
    {
        var userCmdTable = db.get("userCmd");
        userCmdTable.save({"cmdCode":"A01", "userTypeId":typedata["manager"]});
        userCmdTable.save({"cmdCode":"A02", "userTypeId":typedata["manager"]});
        cb(null);
    },
    //add ip
    function(cb)
    {
        var machineTable = db.get("machine");
        machineTable.save({"_id":"server", "ip":"192.168.11.147"});
        machineTable.save({"_id":"workLocal", "ip":"192.168.11.147"});
        machineTable.save({"_id":"homeLocal", "ip":"192.168.1.100"});

        var proInfoTable = db.get("proInfo");
        proInfoTable.save({"machineId":"workLocal", "proc":"/usr/sbin/mysqld"});
        proInfoTable.save({"machineId":"workLocal", "proc":"/home/liming/app/mongodb/bin/mongod"});
        proInfoTable.save({"machineId":"workLocal", "proc":"scheduler"});

        proInfoTable.save({"machineId":"homeLocal", "proc":"/usr/sbin/mysqld"});
        proInfoTable.save({"machineId":"homeLocal", "proc":"/home/liming/app/mongodb/bin/mongod"});
        proInfoTable.save({"machineId":"homeLocal", "proc":"scheduler"});
        cb(null);
    }
], function (err, result) {
    console.log('err: ', err); // -> null
    console.log('result: ', result); // -> 16
});


