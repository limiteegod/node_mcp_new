var db = require('../config/Database.js');
var digestUtil = require("../util/DigestUtil.js");

var PageControl = function(){};

PageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    if(cmd == "admin/login")
    {
        var backBodyNode = {title:"login", tip:"Welcome to login at my website."};
        cb(null, backBodyNode);
    }
    else if(cmd == "admin/selectUserType")
    {
        var backBodyNode = {title:"select user type"};
        var userTypeTable = db.get("userType");
        userTypeTable.find({}, {name:1}).toArray(function(err,data){
            backBodyNode.rst = data;
            cb(null, backBodyNode);
        });
    }
    else if(cmd == "admin/selectOperation")
    {
        var backBodyNode = {title:"select operation"};
        var operationTable = db.get("operation");
        operationTable.find({}, {name:1, url:1, parentId:1}).toArray(function(err,data){
            backBodyNode.rst = data;
            backBodyNode.data = JSON.parse(digestUtil.check({digestType:'3des-empty'}, digestUtil.getEmptyKey(), bodyNode.data));
            cb(null, backBodyNode);
        });
    }
    else if(cmd == "admin/showUserType")
    {
        var backBodyNode = {title:"show user type"};
        var userTypeTable = db.get("userType");
        userTypeTable.find({}, {name:1}).toArray(function(err,data){
            backBodyNode.rst = data;
            //backBodyNode.data = JSON.parse(digestUtil.check({digestType:'3des-empty'}, null, bodyNode.data));
            cb(null, backBodyNode);
        });
    }
    else
    {
        cb(null, {});
    }
};

var pageControl = new PageControl();
module.exports = pageControl;