var http = require('http');
var querystring = require('querystring');
var prop = require('../config/Prop.js');
var gt = prop.platform.gateway;

var GatewayInterUtil = function(){};

GatewayInterUtil.prototype.get= function(service, headStr, bodyStr, cb)
{
    var post_data  = querystring.stringify({
        head:headStr,
        body:bodyStr
    });
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length':post_data.length
    };
    var options = {ip:gt.ip, port:gt.port, method:gt.method, path:service.path};
    options.headers = headers;
    console.log(options);
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function(){
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

var gatewayInterUtil = new GatewayInterUtil();
module.exports = gatewayInterUtil;



