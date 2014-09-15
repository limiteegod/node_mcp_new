var express = require('express'), app = express();
var http = require('http');
var async = require('async');
var httpServer = http.createServer(app);
var io = require('socket.io')(httpServer);
var cmdFactory = require("./app/control/CmdFactory.js");
var pageControl = require("./app/control/PageControl.js");
var errCode = require("./app/config/ErrCode.js");
var digestUtil = require("./app/util/DigestUtil.js");
var net = require('net');
var osUtil = require('./app/util/OsUtil.js');
var monitorFactory = require('./app/common/MonitorFactory.js');

//app.use(express.logger());

var App = function(io){
    var self = this;
    self.io = io;
};

App.prototype.start = function()
{
    var self = this;
    async.waterfall([
        function(cb)
        {
            self.startSocket();
            self.startWeb();
            cb(null, "success");
        }
    ], function (err, result) {
        if(err)
        {
            console.log('err: ', err); // -> null
        }
        else
        {
            console.log('result: ', result); // -> 16
        }
    });
};

App.prototype.startSocket = function()
{
    var self = this;
    //listen data from other machine
    var HOST = osUtil.getLocaleIp();
    var PORT = 9081;
    net.createServer(function(sock) {
        var buf = new Buffer(10*1024);
        //current length of buf
        var curBufLen = 0;
        //data length of the data that will be received from terminal.
        var tBufLen = 0;
        // 我们获得一个连接 - 该连接自动关联一个socket对象
        console.log('CONNECTED: ' +
            sock.remoteAddress + ':' + sock.remotePort);
        // 为这个socket实例添加一个"data"事件处理函数
        sock.on('data', function(data) {
            //append data to buffer
            data.copy(buf, curBufLen, 0, data.length);
            curBufLen += data.length;

            //console.log("data append length:" + data.length);
            if(tBufLen == 0 && curBufLen >= 4)    //command start point.
            {
                tBufLen = buf.readInt32BE(0);
                //console.log("cmd data length:" + tBufLen);
            }
            //console.log("curBufLen:" + curBufLen + ",tBufLen:" + tBufLen);

            //cmd data all received
            while(curBufLen >= tBufLen + 4 && tBufLen > 0)
            {
                var cmdDataBuf = new Buffer(tBufLen);
                buf.copy(cmdDataBuf, 0, 4, tBufLen + 4);
                if(curBufLen > tBufLen + 4)
                {
                    curBufLen = curBufLen - tBufLen - 4;
                    var exchangeBuf = new Buffer(curBufLen);
                    buf.copy(exchangeBuf, 0, tBufLen + 4, tBufLen + curBufLen + 4);
                    exchangeBuf.copy(buf, 0, 0, curBufLen);
                }
                else
                {
                    curBufLen = 0;
                }
                tBufLen = 0;
                if(curBufLen >= 4)    //command start point.
                {
                    tBufLen = buf.readInt32BE(0);
                }
                monitorFactory.handle(cmdDataBuf, function(err, headNode, bodyNode){
                    var msgNode = {head:headNode, body:JSON.stringify(bodyNode)};
                    self.io.emit("message", JSON.stringify(msgNode));
                });
            }
            //console.log("curBufLen:" + curBufLen + ",tBufLen:" + tBufLen);
        });

        // 为这个socket实例添加一个"close"事件处理函数
        sock.on('close', function(data) {
            console.log('CLOSED: ' +
                sock.remoteAddress + ' ' + sock.remotePort);
        });

    }).listen(PORT, HOST);
};


App.prototype.startWeb = function()
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

    app.get('/:name', function(req, res, next){
        var path = req.params.name.match(/^([a-zA-Z0-9_]+)(\.html)$/);
        if(path)
        {
            var jadePathArray = path[1].split("_");
            var jadePath = jadePathArray.join("/");
            var headNode = {cmd:jadePathArray};
            pageControl.handle(headNode, req.query, function(err, data){
                if(err) throw err;
                console.log(data);
                res.render(jadePath, data);
            });
        }
        else
        {
            next();
        }
    });

    app.post("/main/interface.htm", function(req, res){
        var message = req.body.message;
        console.log(message);
        var msgNode = JSON.parse(message);
        var headNode = msgNode.head;
        var bodyStr = msgNode.body;
        console.log(bodyStr);
        cmdFactory.handle(headNode, bodyStr, function(err, bodyNode){
            var key;
            if(err)
            {
                key = digestUtil.getEmptyKey();
                headNode.digestType = "3des-empty";
                if(bodyNode == undefined)
                {
                    bodyNode = {};
                }
                bodyNode.code = err.code;
                bodyNode.description = err.description;
            }
            else
            {
                bodyNode.code = errCode.E0000.code;
                bodyNode.description = errCode.E0000.description;

                key = headNode.key;
                headNode.digestType = "3des";
                headNode.key = undefined;
            }
            var decodedBodyStr = digestUtil.generate(headNode, key, JSON.stringify(bodyNode));
            res.json({head:headNode, body:decodedBodyStr});
        });
    });

    self.io.on('connection', function(socket){

        console.log('a user connected');

        socket.on('message', function(msg){
            self.io.emit('message', msg);
        });

        socket.on('disconnect', function(){
        });
    });

    httpServer.listen(9080);
};

new App(io).start();


