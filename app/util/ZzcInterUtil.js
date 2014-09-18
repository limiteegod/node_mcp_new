var http = require('http');
var querystring = require('querystring');
var prop = require('../config/Prop.js');
var digestUtil = require('./DigestUtil.js');
var options = prop.zzc.site;
var zzc = prop.zzc;

var ZzcInterUtil = function(){};

ZzcInterUtil.prototype.get= function(transcode, msg, cb)
{
    var key = digestUtil.md5(transcode + msg + zzc.key);
    var post_data  = querystring.stringify({
        transcode:transcode,
        msg:msg,
        key:key,
        pratnerid:zzc.pratnerid
    });
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    options.headers = headers;
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            cb(chunk);
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.write(post_data, "utf8");
    req.end();
};

var zzcInterUtil = new ZzcInterUtil();

module.exports = zzcInterUtil;