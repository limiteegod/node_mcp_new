var util = require('mcp_util');
var platInterUtil = util.platInterUtil;

var esut = require("easy_util");
var log = esut.log;
var digestUtil = esut.digestUtil;

var LotTest = function(){
    var self = this;
    self.userId = 'Q0003';
    self.channelCode = 'Q0003';
    self.userType = 2;
    self.key = 'cad6011f5f174a359d9a36e06aada07e';
    self.cmd = 'T03';
    self.jcCmd = 'T06';
};

LotTest.prototype.lot = function(bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.channelCode, "md5", self.key, self.cmd, bodyNode, cb);
};

LotTest.prototype.lotJc = function(bodyNode, cb)
{
    var self = this;
    platInterUtil.get(self.userId, self.userType, self.channelCode, "md5", self.key, self.jcCmd, bodyNode, cb);
};

LotTest.prototype.lotT01 = function()
{
    var self = this;
    var bodyNode = {};
    var orderNode = {gameCode:'T01', termCode:'2014001', amount:200, multiple:1, outerId:digestUtil.createUUID(), platform:"ANDROID"};
    var ticketsNode = [{betTypeCode:'00', amount:200, playTypeCode:'00', multiple:1, numbers:'01,02,03,04,05|01,02'}];
    orderNode.tickets = ticketsNode;
    bodyNode.order = orderNode;
    self.lot(bodyNode, function(backMsgNode){
        var backBodyStr = digestUtil.check(backMsgNode.head, self.key, backMsgNode.body);
        var backBodyNode = JSON.parse(backBodyStr);
        console.log("back-body:");
        console.log(backBodyNode);
    });
};

LotTest.prototype.lotF01 = function()
{
    var self = this;
    var bodyNode = {};
    var orderNode = {gameCode:'F01', termCode:'2014001', amount:2000, multiple:1, outerId:digestUtil.createUUID(), platform:"ANDROID"};
    var ticketsNode = [{betTypeCode:'00', amount:200, playTypeCode:'00', multiple:1, numbers:'09,14,17,18,21,25|15'},
        {betTypeCode:'01', amount:1400, playTypeCode:'00', multiple:1, numbers:'09,14,17,18,21,25,26|15'},
        {betTypeCode:'02', amount:400, playTypeCode:'00', multiple:1, numbers:'09,14,17,18,21$25,26|10'}];
    orderNode.tickets = ticketsNode;
    bodyNode.order = orderNode;
    self.lot(bodyNode, function(err, backMsgNode){
        if(err)
        {
            log.info('err:' + err);
        }
        else
        {
            log.info('back:');
            log.info(backMsgNode);
        }
    });
};

var lotTest = new LotTest();
var count = 0;
while(count < 1000)
{
    lotTest.lotF01();
    count++;
}
