var StationType = function(){
    var self = this;
    self.info = [{id:0, code:'COMMON', des:"普通投注站"},
        {id:1, code:'CENTER', des:"出票中心"},
        {id:2, code:'CHANNEL', des:"销售渠道"},
        {id:3, code:'DEFAULT', des:"自有渠道"}];
    self.infoArray = {};
    self.init();
};

StationType.prototype.init = function()
{
    var self = this;
    for(var key in self.info)
    {
        var set = self.info[key];
        self.infoArray[set.id] = set;
        self[set.code] = set;
    };
};

StationType.prototype.getInfoById = function(id)
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

module.exports = new StationType();

