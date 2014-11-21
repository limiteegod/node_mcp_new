var esut = require("easy_util");
var log = esut.log;
var dateUtil = esut.dateUtil;
var digestUtil = esut.digestUtil;
var dateUtil = esut.dateUtil;

var str = '{"repCode":"0000","description":"系统处理成功","order":{"id":"c2405ac0f8ab4a05bd978427c5918702","termCode":"14137","schemeId":null,"gameCode":"T01","outerId":"141121130957010011032","amount":200,"ticketCount":1,"bonus":0,"acceptTime":"2014-11-21T13:09:53.000+0800","status":1200,"multiple":1,"numbers":null,"printTime":"2014-11-21T13:10:07.000+0800","tickets":[{"id":"40058cdab2344f1baddad5c3f7283573","channelCode":"BJJG","terminalId":"00011607"}]}}2014-11-21T13:10:07.669+08000okmnhy6123';
var md5 = digestUtil.md5(str);
console.log(md5);