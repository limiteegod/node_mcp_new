var http = require('http');
var querystring = require('querystring');
var moment = require('moment');
var select = require('xpath.js');
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var prop = require('../config/Prop.js');
var digestUtil = require('./DigestUtil.js');
var options = prop.zzc.site;
var zzc = prop.zzc;

var ZzcInterUtil = function(){};

ZzcInterUtil.prototype.get= function(transcode, msg, cb)
{
    var key = digestUtil.md5(transcode + msg + zzc.key).substring(0, 16).toUpperCase();
    var post_data  = querystring.stringify({
        transcode:transcode,
        key:key,
        partnerid:zzc.partnerid,
        version:zzc.version,
        msg:msg
    });
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length':post_data.length
    };
    options.headers = headers;
    console.log(options.headers);
    console.log(msg);
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function(){
            console.log(data);
            cb(null, data);
        });
    });
    req.setTimeout(20000, function(){
        cb(new Error("time out"), null);
    });
    req.on('error', function(err) {
        cb(err, null);
    });
    req.write(post_data, "utf8");
    req.end();
};

ZzcInterUtil.prototype.sendTickets = function(tickets, cb)
{
    var self = this;
    var doc = new DOMParser().parseFromString(
        '<?xml version="1.0" encoding="UTF-8"?><msg></msg>'
        ,'text/xml');
    var ticketsEle = doc.createElement("tickets");
    var totalMoney = 0;
    for(var key in tickets)
    {
        var ticket = tickets[key];
        totalMoney += ticket.amount;

        var ticketEle = doc.createElement("ticket");
        ticketEle.setAttribute("id", ticket.zzcId);
        ticketEle.setAttribute("multiple", ticket.multiple);
        ticketEle.setAttribute("issue", ticket.termCode);
        ticketEle.setAttribute("playtype", self.getPlaytype(ticket));
        ticketEle.setAttribute("money", ticket.amount/100);

        var ballEle = doc.createElement("ball");
        var ballText = doc.createTextNode(ticket.ball);
        ballEle.appendChild(ballText);
        ticketEle.appendChild(ballEle);
        ticketsEle.appendChild(ticketEle);
    }
    totalMoney = totalMoney/100;
    var headEle = doc.createElement("head");
    headEle.setAttribute("transcode", '104');
    headEle.setAttribute("partnerid", zzc.partnerid);
    headEle.setAttribute("version", zzc.version);
    headEle.setAttribute("time", moment().format(zzc.dateFmt));
    var bodyEle = doc.createElement("body");
    doc.documentElement.appendChild(headEle);
    doc.documentElement.appendChild(bodyEle);
    var ticketOrderEle = doc.createElement("ticketorder");
    var userEle = doc.createElement("user");
    userEle.setAttribute("idcard", zzc.user.idCard);
    userEle.setAttribute("userid", zzc.user.userId);
    userEle.setAttribute("phone", zzc.user.phone);
    userEle.setAttribute("realname", zzc.user.realname);
    ticketOrderEle.appendChild(userEle);
    ticketOrderEle.setAttribute("gameid", self.getGameId(ticket));
    ticketOrderEle.setAttribute("ticketsnum", tickets.length);
    ticketOrderEle.setAttribute("totalmoney", totalMoney);
    ticketOrderEle.appendChild(ticketsEle);
    bodyEle.appendChild(ticketOrderEle);
    var serializer = new XMLSerializer;
    var str = serializer.serializeToString(doc);
    self.get("104", str, function(err, backMsg){
        cb(err, backMsg);
    });
};

ZzcInterUtil.prototype.getPlaytype = function(ticket)
{
    var self = this;
    if(ticket.gameCode == 'F01')
    {
        if(ticket.betTypeCode == '00')
        {
            return '0';
        }
        else if(ticket.betTypeCode == '01')
        {
            return '1';
        }
        else if(ticket.betTypeCode == '02')
        {
            return '2';
        }
    }
};

ZzcInterUtil.prototype.getGameId = function(ticket)
{
    if(ticket.gameCode == 'F01')
    {
        return 'SSQ';
    }
};

ZzcInterUtil.prototype.getBall = function(ticket)
{
    var self = this;
    if(ticket.gameCode == 'F01')
    {
        return ticket.numbers.replace("|", ":").replace("$", ":").replace("#", ":").replace(";", "#");
    }
};

/**
 * get ticket json objects from xml string
 * @param msg
 */
ZzcInterUtil.prototype.getJsonFromXml = function(msg)
{
    var self = this;
    var tickets = [];
    var doc = new DOMParser().parseFromString(msg, 'text/xml');
    var ticketNodes = select(doc, '/msg/body/ticketorder/tickets/ticket');
    for(var key in ticketNodes)
    {
        var ticketNode = ticketNodes[key];
        var ticket = {};
        ticket.id = ticketNode.getAttribute("id");
        ticket.statusCode = ticketNode.getAttribute("statuscode");
        ticket.msg = ticketNode.getAttribute("msg");
        tickets[tickets.length] = ticket;
    }
    return tickets;
};

var zzcInterUtil = new ZzcInterUtil();

module.exports = zzcInterUtil;