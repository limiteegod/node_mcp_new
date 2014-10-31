var Service = function(){
    var self = this;
    self.cmdArray =
    [
        {cmd:"A01", path:"/mcp/account/register.htm"},
        {cmd:"A02", path:"/mcp/account/query.htm"},
        {cmd:"A03", path:"/mcp/account/modifyPassword.htm"},
        {cmd:"A04", path:"/mcp/account/login.htm"},
        {cmd:"A05", path:"/mcp/account/modifyInfo.htm"},
        {cmd:"A06", path:"/mcp/account/channelLogin.htm"},
        {cmd:"A07", path:"/mcp/account/channelQuery.htm"},

        {cmd:"T01", path:"/mcp/trade/lot.htm"},
        {cmd:"T02", path:"/mcp/trade/afford.htm"},
        {cmd:"T03", path:"/mcp/trade/clot.htm"},
        {cmd:"T04", path:"/mcp/trade/cValidate.htm"},
        {cmd:"T05", path:"/mcp/jctrade/jcLot.htm"},
        {cmd:"T06", path:"/mcp/jctrade/cJcLot.htm"},

        {cmd:"P01", path:"/mcp/print/getOrders.htm"},
        {cmd:"P02", path:"/mcp/print/printBack.htm"},
        {cmd:"P03", path:"/mcp/print/getAllToPrize.htm"},
        {cmd:"P04", path:"/mcp/print/prizeBack.htm"},
        {cmd:"P05", path:"/mcp/print/login.htm"},
        {cmd:"P06", path:"/mcp/print/printByOrderId.htm"},
        {cmd:"P07", path:"/mcp/print/regUser.htm"},
        {cmd:"P08", path:"/mcp/print/printBackByOrder.htm"},
        {cmd:"P09", path:"/mcp/print/printPaper.htm"},
        {cmd:"P10", path:"/mcp/print/resetTakeAway.htm"},
        {cmd:"P11", path:"/mcp/print/printFailure.htm"},
        {cmd:"P12", path:"/mcp/print/getPrintQueen.htm"},
        {cmd:"P20", path:"/mcp/print/getNewPrintQueen.htm"},
        {cmd:"P21", path:"/mcp/print/newPrintBack.htm"},



        {cmd:"Q01", path:"/mcp/query/getGameTerm.htm"},
        {cmd:"Q02", path:"/mcp/query/getScheme.htm"},
        {cmd:"Q03", path:"/mcp/query/getBetHistory.htm"},
        {cmd:"Q04", path:"/mcp/query/getBetAccountLog.htm"},
        {cmd:"Q05", path:"/mcp/query/getStation.htm"},
        {cmd:"Q07", path:"/mcp/query/getSystemTime.htm"},
        {cmd:"Q08", path:"/mcp/query/infoCollect.htm"},
        {cmd:"Q09", path:"/mcp/query/getFiles.htm"},
        {cmd:"Q10", path:"/mcp/query/getTicket.htm"},
        {cmd:"Q11", path:"/mcp/query/getGamesByStatus.htm"},
        {cmd:"Q12", path:"/mcp/query/getMessages.htm"},
        {cmd:"Q13", path:"/mcp/query/getPromotions.htm"},
        {cmd:"Q14", path:"/mcp/query/getJcMatches.htm"},
        {cmd:"Q15", path:"/mcp/query/cGetBetHistory.htm"},
        {cmd:"Q16", path:"/mcp/query/cGetTerm.htm"},
        {cmd:"Q17", path:"/mcp/query/cGetNotifyMsg.htm"},

        {cmd:"R01", path:"/mcp/resource/sendShortMsg.htm"},
        {cmd:"R02", path:"/mcp/resource/findBackPsd.htm"},
        {cmd:"R03", path:"/mcp/resource/bindBank.htm"},
        {cmd:"R04", path:"/mcp/resource/bindPhone.htm"},

        {cmd:"N04", path:"/mcp/notify/termNotify.htm"},
        {cmd:"N05", path:"/mcp/notify/printNotify.htm"},
        {cmd:"N06", path:"/mcp/notify/receiptNotify.htm"},
        {cmd:"N07", path:"/mcp/notify/oddsNotify.htm"},

        {cmd:"C01", path:"/mcp/cash/prizeToRecharge.htm"},
        {cmd:"C02", path:"/mcp/cash/rechargeAtStation.htm"},
        {cmd:"C03", path:"/mcp/cash/prizeToOut.htm"},
        {cmd:"C04", path:"/mcp/cash/coupon.htm"},
        {cmd:"C05", path:"/mcp/cash/getCoupon.htm"},

        {cmd:"S01", path:"/mcp/scheme/zh.htm"},
        {cmd:"S02", path:"/mcp/scheme/query.htm"},
        {cmd:"S03", path:"/mcp/scheme/cancel.htm"},
        {cmd:"S04", path:"/mcp/scheme/hm.htm"},
        {cmd:"S05", path:"/mcp/scheme/joinHm.htm"},

        {cmd:"J01", path:"/mcp/jbank/login.htm"},
        {cmd:"J02", path:"/mcp/jbank/getUser.htm"},
        {cmd:"J03", path:"/mcp/jbank/modifyInfo.htm"},
        {cmd:"J04", path:"/mcp/jbank/register.htm"},
        {cmd:"J05", path:"/mcp/jbank/affordFromBank.htm"},
        {cmd:"J06", path:"/mcp/jbank/getCurTerm.htm"},
        {cmd:"J07", path:"/mcp/jbank/getCurTermOrders.htm"},
        {cmd:"J08", path:"/mcp/jbank/getLastTermHit.htm"},

        {cmd:"AD01", path:"/mcp/admin/login.htm"},
        {cmd:"AD02", path:"/mcp/admin/addToPrintQueen.htm"},
        {cmd:"AD03", path:"/mcp/admin/getTermReportInfo.htm"},
        {cmd:"AD04", path:"/mcp/admin/getTermInfo.htm"},

        {cmd:"AP01", path:"/mcp/admin/operation/query.htm"}
    ];

    var cmdMap = {};
    for(var key in self.cmdArray)
    {
        cmdMap[self.cmdArray[key].cmd] = self.cmdArray[key];
    }
    self.cmdMap = cmdMap;
};

Service.prototype.getByCode = function(code)
{
    var self = this;
    return self.cmdMap[code];
};

module.exports = new Service();