var express = require('express'), app = express();
var http = require('http');
var async = require('async');
var httpServer = http.createServer(app);
var prop = require('./app/config/Prop.js');
var errCode = require('./app/config/ErrCode.js');
var cmdFactory = require("./app/control/CmdFactory.js");
var dc = require('./app/config/DbCenter.js');

var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var Gateway = function(){
    var self = this;
};

Gateway.prototype.start = function(){
    var self = this;
    async.waterfall([
        //connect db
        function(cb)
        {
            dc.init(function(err){
                cb(err);
            });
        },
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

Gateway.prototype.startWeb = function()
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
    app.use(express.static('/data/app/node_kissy/public'));

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
        self.handle(message, function(backMsgNode){
            res.json(backMsgNode);
            log.info(backMsgNode);
        });
    });

    app.get("/mcp-filter/main/interface.htm", function(req, res){
        var message = req.query.message;
        self.handle(message, function(backMsgNode){
            res.json(backMsgNode);
            log.info(backMsgNode);
        });
    });

    httpServer.listen(9081);
};

Gateway.prototype.handle = function(message, cb)
{
    var self = this;
    log.info(message);
    try {
        var msgNode = JSON.parse(message);
        var headNode = msgNode.head;
        var bodyStr = msgNode.body;
        cmdFactory.handle(headNode, bodyStr, function(err, bodyNode) {
            var key = headNode.key;
            headNode.key = undefined;
            if(key == undefined)
            {
                key = digestUtil.getEmptyKey();
                if(headNode.digestType == '3des')
                {
                    headNode.digestType = "3des-empty";
                }
            }
            if (bodyNode == undefined) {
                bodyNode = {};
            }
            if (err) {
                bodyNode.repCode = err.repCode;
                bodyNode.description = err.description;
            }
            else
            {
                bodyNode.repCode = errCode.E0000.repCode;
                bodyNode.description = errCode.E0000.description;
            }
            log.info(bodyNode);
            var decodedBodyStr = digestUtil.generate(headNode, key, JSON.stringify(bodyNode));
            cb({head: headNode, body: decodedBodyStr});
        });
    }
    catch (err)
    {
        cb({head:{cmd:'E01'}, body:JSON.stringify(errCode.E2058)});
        return;
    }
};

var gateway = new Gateway();
gateway.start();