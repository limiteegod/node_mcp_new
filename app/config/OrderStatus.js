var OrderStatus = function(){
    var self = this;
    self.info = [{id:1000, code:'init', des:"初始状态"},
        {id:1001, code:'presale', des:"预售"},
        {id:1100, code:'waiting_print', des:"等待出票"},
        {id:1200, code:'success', des:"出票成功"},
        {id:1300, code:'partial_success', des:"部分出票成功"}];
    self.infoArray = {};
    self.init();
};

OrderStatus.prototype.init = function()
{
    var self = this;
    for(var key in self.info)
    {
        var set = self.info[key];
        self.infoArray[set.id] = set;
        self.infoArray[set.code] = set;
    };
};

OrderStatus.prototype.getInfoById = function(id)
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

module.exports = new OrderStatus();
