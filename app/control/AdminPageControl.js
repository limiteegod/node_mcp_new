var db = require('../config/Database.js');
var digestUtil = require("../util/DigestUtil.js");

var AdminPageControl = function(){};

AdminPageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[1]](headNode, bodyNode, cb);
};


AdminPageControl.prototype.login = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"login", tip:"Welcome to login at my website."};
    cb(null, backBodyNode);
};

AdminPageControl.prototype.showUserType = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"show user type"};
    var userTypeTable = db.get("userType");
    userTypeTable.find({}, {name:1}).toArray(function(err,data){
        backBodyNode.rst = data;
        //backBodyNode.data = JSON.parse(digestUtil.check({digestType:'3des-empty'}, null, bodyNode.data));
        cb(null, backBodyNode);
    });
};

AdminPageControl.prototype.selectOperation = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"select operation"};
    var operationTable = db.get("operation");
    operationTable.find({}, {name:1, url:1, parentId:1}).toArray(function(err,data){
        backBodyNode.rst = data;
        backBodyNode.data = JSON.parse(digestUtil.check({digestType:'3des-empty'}, digestUtil.getEmptyKey(), bodyNode.data));
        cb(null, backBodyNode);
    });
};

AdminPageControl.prototype.selectUserType = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"select user type"};
    var userTypeTable = db.get("userType");
    userTypeTable.find({}, {name:1}).toArray(function(err,data){
        backBodyNode.rst = data;
        var fromData = JSON.parse(digestUtil.check({digestType:'3des-empty'}, digestUtil.getEmptyKey(), bodyNode.data));
        if(fromData[0])
        {
            backBodyNode.selectedId = fromData[0]._id;
        }
        else
        {
            backBodyNode.selectedId = backBodyNode.rst[0]._id;
        }
        cb(null, backBodyNode);
    });
};

AdminPageControl.prototype.showOperation = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"show operation"};
    var operationTable = db.get("operation");
    operationTable.find({}, {name:1}).toArray(function(err,data){
        backBodyNode.rst = data;
        //backBodyNode.data = JSON.parse(digestUtil.check({digestType:'3des-empty'}, null, bodyNode.data));
        cb(null, backBodyNode);
    });
};

AdminPageControl.prototype.setOperation = function(headNode, bodyNode, cb)
{
    var self = this;
    cb(null, {});
};

AdminPageControl.prototype.index = function(headNode, bodyNode, cb)
{
    var self = this;
    cb(null, {});
};

AdminPageControl.prototype.top = function(headNode, bodyNode, cb)
{
    var self = this;
    cb(null, {});
};

AdminPageControl.prototype.left = function(headNode, bodyNode, cb)
{
    var self = this;
    cb(null, {});
};

AdminPageControl.prototype.main = function(headNode, bodyNode, cb)
{
    var self = this;
    cb(null, {});
};

var adminPageControl = new AdminPageControl();
module.exports = adminPageControl;