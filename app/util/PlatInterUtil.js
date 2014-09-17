var http = require('http');
var querystring = require('querystring');
var crypto = require('crypto');
var prop = require('../config/Prop.js');
var digestUtil = require('./DigestUtil.js');
var options = prop.platform.site;
var PlatInterUtil = function(){};

PlatInterUtil.prototype.get= function(userId, userType, channelCode, userKey, cmd, body, cb)
{
    body.uniqueId = digestUtil.createUUID();
    var bodyStr = JSON.stringify(body);
    console.log("send-body:");
    console.log(bodyStr);
    var head = {userId:userId, userType:userType, channelCode:channelCode, digest:"", digestType:"3des", cmd:cmd, ver:prop.platform.ver};
    if(cmd == "AD01")
    {
        head.digestType = "";
    }
    var encodedBody = bodyStr;
    if(head.digestType.length > 0)
    {
        encodedBody = digestUtil.generate(head, userKey, bodyStr);
    }
    var msgJson = {head:head, body:encodedBody};
    var msgToSend = JSON.stringify(msgJson);
    var post_data  = querystring.stringify({
        message:msgToSend
    });
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    options.headers = headers;
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            cb(JSON.parse(chunk));
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.write(post_data, "utf8");
    req.end();
};

var platInterUtil = new PlatInterUtil();

module.exports = platInterUtil;



