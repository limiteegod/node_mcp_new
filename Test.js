var config = require('mcp_config');
var ec = config.ec;

var dc = require("mcp_dao").dc;

var esutil = require("easy_util");
var log = esutil.log;

log.info(ec.E0000);

dc.init(function(err, data){
    if(err)
    {
        log.info("初始化数据库连接出错...............");
        log.info(err);
    }
    else
    {
        var table = dc.main.get("game");
        table.find({}, {}).toArray(function(err, data){
            log.info(data);
        });
    }
})

