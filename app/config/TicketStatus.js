var TicketStatus = function(){
    var self = this;
    self.info = [{id:1000, code:'init', des:"初始状态"},
        {id:1080, code:'waiting_pay', des:"等待支付"},
        {id:1090, code:'presale', des:"预售"},
        {id:1100, code:'waiting_print', des:"等待打印"},
        {id:1200, code:'take_away', des:"程序取走"},
        {id:1300, code:'print_success', des:"打印成功"},
        {id:1500, code:'print_failure', des:"打印失败"}];
    self.infoArray = {};
    self.init();
};

TicketStatus.prototype.init = function()
{
    var self = this;
    for(var key in self.info)
    {
        var set = self.info[key];
        self.infoArray[set.id] = set;
        self[set.code] = set.id;
    };
};

TicketStatus.prototype.getInfoById = function(id)
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

module.exports = new TicketStatus();

