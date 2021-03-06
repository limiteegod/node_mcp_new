var express = require('express'), app = express();
var http = require('http');
var async = require('async');
var httpServer = http.createServer(app);

var config = require('mcp_config');
var prop = config.prop;
var errCode = config.ec;
var service = config.service;

var util = require('mcp_util');
var gatewayInterUtil = util.gatewayInterUtil;
var platInterUtil = util.platInterUtil;

var esut = require("easy_util");
var log = esut.log;

var Filter = function(){
    var self = this;
};

Filter.prototype.start = function(){
    var self = this;
    async.waterfall([
        //start web
        function(cb)
        {
            self.startWeb();
            cb(null, "success");
        }
    ], function (err, result) {
        if(err)
        {
            console.error(err); // -> null
        }
        else
        {
            console.log(result); // -> 16
        }
    });
};


Filter.prototype.startWeb = function()
{
    var self = this;

    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    //是Connect內建的middleware，设置此处可以将client提交过来的post请求放入request.body中
    app.use(express.bodyParser());
    //是Connect內建的，可以协助处理POST请求伪装PUT、DELETE和其他HTTP methods
    app.use(express.methodOverride());
    //route requests
    app.use(app.router);
    //public文件夹下面的文件，都暴露出来，客户端访问的时候，不需要使用public路径
    app.use(express.static(__dirname + '/public'));

    app.configure('development', function(){
        app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    });

    app.configure('production', function(){
        app.use(express.errorHandler());
    });

    app.get('/', function(req, res){
        res.render('index', {
            title: 'Express',
            youAreUsingJade:true
        });
    });

    app.post("/mcp-filter/main/interface.htm", function(req, res){
        var message = req.body.message;
        self.handle(message, function(backMsg){
            try {
                res.type('application/json;charset=utf-8');
                res.send(backMsg);
            }
            catch (err)
            {
                log.info(err);
            }
        });
    });

    app.get("/mcp-filter/main/interface.htm", function(req, res){
        var message = req.query.message;
        self.handle(message, function(backMsg){
            try {
                res.type('application/json;charset=utf-8');
                res.send(backMsg);
            }
            catch (err)
            {
                log.info(err);
            }
        });
    });

    httpServer.listen(prop.filterPort);
};

Filter.prototype.handle = function(message, cb)
{
    var self = this;
    var msgNode;
    var headNode;
    var ser;
    try {
        msgNode = JSON.parse(message);
        headNode = msgNode.head;
        ser = service.getByCode(headNode.cmd);
    }
    catch (err)
    {
        log.info(err);
        cb(JSON.stringify({head:{cmd:'E01'}, body:JSON.stringify(errCode.E2058)}));
        return;
    }
    var start = new Date().getTime();
    if(prop.cmdToNew[headNode.cmd] != undefined)
    {
        platInterUtil.getNew(message, function(err, backMsg){
            if(err)
            {
                console.log('problem with request: ', err);
                backMsg = JSON.stringify({head:headNode, body:JSON.stringify(errCode.E2059)});
            }
            var end = new Date().getTime();
            log.info(headNode.cmd + ":" + headNode.channelCode + ":" + headNode.id + ",用时:" + (end - start) + "ms");
            cb(backMsg);
        });
    }
    else
    {
        gatewayInterUtil.get(ser, JSON.stringify(headNode), msgNode.body, function(err, backMsg){
            if(err)
            {
                console.log('problem with request: ', err);
                backMsg = JSON.stringify({head:headNode, body:JSON.stringify(errCode.E2059)});
            }
            var end = new Date().getTime();
            log.info(headNode.cmd + ":" + headNode.channelCode + ":" + headNode.id + ",用时:" + (end - start) + "ms");
            cb(backMsg);
        });
    }
};

var f = new Filter();
f.start();