var TermStatus = function(){
    var self = this;
    self.info = [{id:1000, code:'INIT', des:'初始状态'},
        {id:1100, code:'NOT_ON_SALE', des:'未开售'},
        {id:1150, code:'PRE_ON_SALE', des:'准备开售中'},
        {id:1200, code:'ON_SALE', des:'正在销售'}];
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

