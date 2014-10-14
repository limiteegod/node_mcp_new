var TermStatus = function(){
    var self = this;
    self.info = [{id:1000, code:'INIT', des:'初始状态'},
        {id:1100, code:'NOT_ON_SALE', des:'未开售'},
        {id:1150, code:'PRE_ON_SALE', des:'准备开售中'},
        {id:1200, code:'ON_SALE', des:'正在销售'},
        {id:1300, code:'PAUSE', des:'销售暂停'},
        {id:1390, code:'PREEND', des:'销售结束中'},
        {id:1400, code:'END', des:'销售结束'},
        {id:1450, code:'SEND', des:'后台销售结束'},
        {id:1460, code:'SYNCHRONIZING', des:'销售同步中'},
        {id:1470, code:'SYNCHRONIZED', des:'销售已同步'},
        {id:1480, code:'DRAW_EXPORT_DATA', des:'导出数据中'},
        {id:1490, code:'WAITING_DRAW_NUMBER', des:'等待录入开奖号码'}];
    self.infoArray = {};
    self.init();
};

TermStatus.prototype.init = function()
{
    var self = this;
    for(var key in self.info)
    {
        var set = self.info[key];
        self.infoArray[set.id] = set;
        self[set.code] = set.id;
    };
};

TermStatus.prototype.getInfoById = function(id)
{
    var self = this;
    var obj = self.info;
    if(id != undefined)
    {
        obj = self.infoArray;
        obj = obj[id];
    }
    return obj;
};

module.exports = new TermStatus();

