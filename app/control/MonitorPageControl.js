var dc = require('../config/DbCenter.js');
var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var prop = require('../config/Prop.js');

var MonitorPageControl = function(){};

MonitorPageControl.prototype.handle = function(headNode, bodyNode, cb)
{
    console.log(bodyNode);
    var self = this;
    var cmd = headNode.cmd;
    self[cmd[1]](headNode, bodyNode, cb);
};


MonitorPageControl.prototype.client = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"client"};
    var machineTable = db.get("machine");
    machineTable.find({}, {ip:1}).toArray(function(err, data){
        backBodyNode.rst = data;
        cb(null, backBodyNode);
    });
};

MonitorPageControl.prototype.detailTicket = function(headNode, bodyNode, cb)
{
    var self = this;
    var backBodyNode = {title:"client"};
    var ticketCol = printMgDb.get("ticket");
    ticketCol.findOne({_id:bodyNode.id}, {}, function(err, data){
        if(data)
        {
            data.status = prop.getEnumById("ticketStatusArray", data.status);
            data.game = prop.getGameInfo(data.gameCode);
            console.log(data);
            backBodyNode.rst = data;
        }
        else
        {
            backBodyNode.rst = {};
        }
        cb(null, backBodyNode);
    });
};

MonitorPageControl.prototype.viewTicket = function(headNode, bodyNode, cb)
{
    var self = this;
    var skip = bodyNode.skip;
    if(skip == undefined)
    {
        skip = 0;
    }
    else
    {
        skip = parseInt(skip);
    }
    var limit = bodyNode.limit;
    if(limit == undefined)
    {
        limit = 20;
    }
    else
    {
        limit = parseInt(limit);
    }
    var sort = bodyNode.sort;
    if(sort == undefined)
    {
        sort = {zzcId:1};
    }
    var cond = bodyNode.cond;
    if(cond == undefined)
    {
        cond = {};
    }
    else
    {
        cond = JSON.parse(cond);
    }
    var backBodyNode = {title:"view tickets", skip:skip, limit:limit};
    backBodyNode.ticketStatusArray = prop.ticketStatusArray;
    backBodyNode.cond = cond;
    backBodyNode.games = prop.games;
    var ticketCol = printMgDb.get("ticket");
    var cursor = ticketCol.find(cond, {}).sort(sort).skip(skip).limit(limit);
    cursor.toArray(function(err, data){
        for(var key in data)
        {
            var ticket = data[key];
            ticket.status = prop.getEnumById("ticketStatusArray", ticket.status);
            ticket.game = prop.getGameInfo(ticket.gameCode);
        }
        backBodyNode.rst = data;


        backBodyNode.count = cursor.count(function(err, count){
            backBodyNode.count = count;
            cb(null, backBodyNode);
        });
    });
};

MonitorPageControl.prototype.mongo = function(headNode, bodyNode, cb) {
    var self = this;
    var backBodyNode = {title:"monitor the mongodb"};
    var rst = [];
    printMgDb.get(null, function(err, data){
        for(var key in data)
        {
            var obj = {name:data[key].collectionName};
            rst[rst.length] = obj;
        }
        backBodyNode.rst = rst;
        console.log(backBodyNode);
        cb(null, backBodyNode);
    });
};

var monitorPageControl = new MonitorPageControl();
module.exports = monitorPageControl;