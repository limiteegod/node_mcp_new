var http = require('http');
var querystring = require('querystring');
var crypto = require('crypto');
var prop = require('../config/Prop.js');
var digestUtil = require('./DigestUtil.js');
var dateUtil = require('./DateUtil.js');
var log = require('./McpLog.js');
var printMgDb = require('../config/PrintMgDb.js');
var options = prop.platform.site;
var PlatInterUtil = function(){};

PlatInterUtil.prototype.get = function(userId, userType, channelCode, digestType, userKey, cmd, body, cb)
{
    body.uniqueId = digestUtil.createUUID();
    log.info(body);
    var bodyStr = JSON.stringify(body);
    var head = {userId:userId, userType:userType, channelCode:channelCode, digest:"", digestType:digestType, cmd:cmd, ver:prop.platform.ver};
    head.timestamp = dateUtil.getCurTime();
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
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length':post_data.length
    };
    options.headers = headers;
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function(){
            cb(null, JSON.parse(data));
        });
    });
    req.setTimeout(20000, function(){
        cb(new Error("time out"), null);
    });
    req.on('error', function(e) {
        cb(e, null);
    });
    req.write(post_data, "utf8");
    req.end();
};

var platInterUtil = new PlatInterUtil();

module.exports = platInterUtil;



